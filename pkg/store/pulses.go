// Package store reads the OTX pulse feed back out of HDFS.
package store

import (
	"bufio"
	"context"
	"encoding/json"
	"maps"
	"path"
	"slices"

	"github.com/vijayvenkatj/threat-stream/pkg/hdfs"
	"github.com/vijayvenkatj/threat-stream/pkg/otx"
)

// maxRecordSize bounds one NDJSON line. Pulses embed an indicators array, so
// the 64KB bufio default is not enough.
const maxRecordSize = 8 << 20

type PulseStore struct {
	fs   *hdfs.Client
	root string
}

func NewPulseStore(fs *hdfs.Client, root string) *PulseStore {
	return &PulseStore{fs: fs, root: root}
}

func (s *PulseStore) Files(ctx context.Context) ([]string, error) {
	partitions, err := s.fs.List(ctx, s.root)
	if err != nil {
		return nil, err
	}

	var files []string
	for _, partition := range partitions {
		if !partition.IsDir() {
			continue
		}

		dir := path.Join(s.root, partition.PathSuffix)
		entries, err := s.fs.List(ctx, dir)
		if err != nil {
			return nil, err
		}

		for _, entry := range entries {
			if !entry.IsDir() {
				files = append(files, path.Join(dir, entry.PathSuffix))
			}
		}
	}

	slices.Sort(files)
	return files, nil
}

// Raw streams the NDJSON records out of each file, unparsed.
func (s *PulseStore) Raw(ctx context.Context, files []string) ([]json.RawMessage, error) {
	records := []json.RawMessage{}

	err := s.scan(ctx, files, func(line []byte) error {
		records = append(records, json.RawMessage(slices.Clone(line)))
		return nil
	})
	if err != nil {
		return nil, err
	}
	return records, nil
}

func (s *PulseStore) Pulses(ctx context.Context) ([]otx.Pulse, error) {
	files, err := s.Files(ctx)
	if err != nil {
		return nil, err
	}

	byID := make(map[string]otx.Pulse)
	err = s.scan(ctx, files, func(line []byte) error {
		var pulse otx.Pulse
		if err := json.Unmarshal(line, &pulse); err != nil {
			return err
		}
		byID[pulse.ID] = pulse
		return nil
	})
	if err != nil {
		return nil, err
	}

	return slices.Collect(maps.Values(byID)), nil
}

// scan opens each file in turn and calls handle with every non-empty NDJSON line.
func (s *PulseStore) scan(ctx context.Context, files []string, handle func(line []byte) error) error {
	for _, file := range files {
		body, err := s.fs.Open(ctx, file)
		if err != nil {
			return err
		}

		err = func() error {
			defer body.Close()

			lines := bufio.NewScanner(body)
			lines.Buffer(make([]byte, 0, 64<<10), maxRecordSize)
			for lines.Scan() {
				if line := lines.Bytes(); len(line) > 0 {
					if err := handle(line); err != nil {
						return err
					}
				}
			}
			return lines.Err()
		}()
		if err != nil {
			return err
		}
	}
	return nil
}
