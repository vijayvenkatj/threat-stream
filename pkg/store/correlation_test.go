package store

import "testing"

func TestStatsOf(t *testing.T) {
	rows := []Correlation{
		fromRow(map[string]any{"pulse_id": "1", "created": "2025-01-05T00:00:00", "adversary": "APT-X", "correlated_categories": "Ransomware,Phishing", "indicators": "a,b,c"}),
		fromRow(map[string]any{"pulse_id": "2", "created": "2025-01-09T00:00:00", "correlated_categories": "Ransomware,Other"}), // nulls omitted
	}
	st := statsOf(rows)

	if st.Pulses != 2 || st.Indicators != 3 {
		t.Fatalf("totals = %d/%d, want 2/3", st.Pulses, st.Indicators)
	}
	if st.Categories[0] != (NameCount{"Ransomware", 2}) {
		t.Fatalf("top category = %+v", st.Categories[0])
	}
	if len(st.Pairs) != 1 || st.Pairs[0].Name != "Phishing + Ransomware" {
		t.Fatalf("pairs = %+v (Other must not pair)", st.Pairs)
	}
	if len(st.Timeline) != 1 || st.Timeline[0] != (NameCount{"2025-01", 2}) {
		t.Fatalf("timeline = %+v", st.Timeline)
	}
}
