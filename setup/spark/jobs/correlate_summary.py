from pyspark.sql import SparkSession
from pyspark.sql.functions import col, size, split

spark = (
    SparkSession.builder
    .appName("OTXThreatSummary")
    .getOrCreate()
)

input_path = "hdfs://namenode:9000/data/correlated/otx.threats"
output_path = "hdfs://namenode:9000/data/correlated/otx.summary"

df = spark.read.json(input_path)

summary_df = df.select(
    col("pulse_id"),
    col("pulse_name"),
    col("created"),
    col("adversary"),
    col("correlated_categories"),
    col("indicator_types"),
    size(split(col("indicators"), ",")).alias("indicator_count"),
    col("targeted_countries")
)

print("CORRELATED THREAT SUMMARY")
summary_df.show(20, truncate=False)

summary_df.write.mode("overwrite").json(output_path)

print("SUMMARY COMPLETE")

spark.stop()