from pyspark.sql import SparkSession
from pyspark.sql.functions import col, explode, concat_ws

spark = (
    SparkSession.builder
    .appName("OTXPulseTransformation")
    .getOrCreate()
)

input_path = "hdfs://namenode:9000/data/raw/otx.pulses"
output_path = "hdfs://namenode:9000/data/processed/otx.pulses"

df = spark.read.json(input_path)

print("SCHEMA")
df.printSchema()

df = df.withColumn("indicator_data", explode(col("indicators")))

clean_df = df.select(
    col("id").alias("pulse_id"),
    col("name").alias("pulse_name"),
    col("created"),
    col("modified"),
    col("description"),
    col("indicator_data.indicator").alias("indicator_value"),
    col("indicator_data.type").alias("indicator_type"),
    col("indicator_data.id").alias("indicator_id"),
    col("adversary"),
    concat_ws(",", col("malware_families")).alias("malware_families"),
    concat_ws(",", col("attack_ids")).alias("attack_ids"),
    concat_ws(",", col("tags")).alias("tags"),
    concat_ws(",", col("industries")).alias("industries"),
    concat_ws(",", col("targeted_countries")).alias("targeted_countries"),
    col("tlp"),
    col("public")
)

print("TRANSFORMED DATA")
clean_df.printSchema()
clean_df.show(10, truncate=False)

# Write processed data
clean_df.write.mode("overwrite").json(output_path)

print("TRANSFORMATION COMPLETE")

spark.stop()