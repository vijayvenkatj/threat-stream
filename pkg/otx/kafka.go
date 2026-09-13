package otx

import (
	"context"
	"encoding/json"
	"log"
	"strings"

	"github.com/segmentio/kafka-go"
)

type Publisher struct {
	Writer *kafka.Writer
}

func NewPublisher(ctx context.Context, brokerAddr string, topics []string) *Publisher {
	err := EnsureTopics(ctx, brokerAddr, topics)
	if err != nil {
		log.Println("unable to create topics", err)
		return nil
	}

	cfg := kafka.WriterConfig{
		Brokers:  []string{brokerAddr},
		Balancer: &kafka.LeastBytes{},
	}
	return &Publisher{
		Writer: kafka.NewWriter(cfg),
	}
}

func (p *Publisher) Publish(ctx context.Context, topic string, data []byte) error {
	return p.Writer.WriteMessages(ctx, kafka.Message{
		Topic: topic,
		Value: data,
	})
}

func (p *Publisher) PublishPulse(ctx context.Context, topic string, value Pulse) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return p.Publish(ctx, topic, data)
}

func (p *Publisher) PublishIndicator(ctx context.Context, topic string, value Indicator) error {
	data, err := json.Marshal(value)
	if err != nil {
		return err
	}

	return p.Publish(ctx, topic, data)
}

func (p *Publisher) Close() error {
	return p.Writer.Close()
}

func EnsureTopics(ctx context.Context, broker string, topics []string) error {
	conn, err := kafka.DialContext(ctx, "tcp", broker)
	if err != nil {
		return err
	}
	defer conn.Close()

	for _, topic := range topics {
		err := conn.CreateTopics(kafka.TopicConfig{
			Topic:             topic,
			NumPartitions:     1,
			ReplicationFactor: 1,
		})

		if err != nil && !strings.Contains(
			strings.ToLower(err.Error()),
			"topic already exists",
		) {
			return err
		}
	}

	return nil
}
