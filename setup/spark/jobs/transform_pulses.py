from pyspark.sql import SparkSession

spark = (
    SparkSession.builder
    .appName("OTXPulseTransformation")
    .getOrCreate()
)

input_path = "hdfs://namenode:9000/data/raw/otx.pulses"
output_path = "hdfs://namenode:9000/data/processed/otx.pulses"

df = spark.read.json(input_path)

df.printSchema()
df.show(10, truncate=False)

df.write.mode("overwrite").json(output_path)

spark.stop()
