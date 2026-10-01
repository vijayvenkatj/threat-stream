from pyspark.sql import SparkSession
from pyspark.sql.functions import col, lower, when, array, array_distinct
from pyspark.sql.functions import expr, collect_set, concat_ws, flatten

spark = (
    SparkSession.builder
    .appName("OTXThreatCorrelation")
    .getOrCreate()
)

input_path = "hdfs://namenode:9000/data/processed/otx.pulses"
output_path = "hdfs://namenode:9000/data/correlated/otx.threats"

df = spark.read.json(input_path)

print("INPUT SCHEMA")
df.printSchema()

correlated_df = df.withColumn(
    "categories",
    array_distinct(array(
        when(lower(col("tags")).contains("ransomware"), "Ransomware"),
        when(lower(col("tags")).contains("phishing"), "Phishing"),
        when(lower(col("tags")).contains("credential"), "Credential Theft"),
        when(lower(col("tags")).contains("supply chain"), "Supply Chain"),
        when(lower(col("tags")).contains("cyberespionage"), "Cyber Espionage"),
        when(lower(col("tags")).contains("banking trojan"), "Banking Trojan"),
        when(lower(col("tags")).contains("cryptocurrency"), "Cryptocurrency"),
        when(lower(col("tags")).contains("backdoor"), "Backdoor"),
        when(lower(col("tags")).contains("social engineering"), "Social Engineering"),
        when(lower(col("tags")).contains("infostealer"), "Information Stealer"),
        when(lower(col("tags")).contains("data exfiltration"), "Data Exfiltration")
    ))
)

correlated_df = correlated_df.withColumn(
    "categories",
    expr("filter(categories, x -> x is not null)")
)

threats_df = correlated_df.groupBy(
    "pulse_id",
    "pulse_name",
    "created",
    "modified",
    "adversary",
    "malware_families",
    "attack_ids",
    "tags",
    "industries",
    "targeted_countries",
    "tlp",
    "public"
).agg(
    concat_ws(",", collect_set("indicator_type")).alias("indicator_types"),
    concat_ws(",", collect_set("indicator_value")).alias("indicators"),
    when(
        concat_ws(",", flatten(collect_set("categories"))) == "",
        "Other"
    ).otherwise(
        concat_ws(",", flatten(collect_set("categories")))
    ).alias("correlated_categories")
)

print("CORRELATED DATA")
threats_df.show(10, truncate=False)

threats_df.write.mode("overwrite").json(output_path)

print("CORRELATION COMPLETE")

spark.stop()