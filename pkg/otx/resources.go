package otx

type Indicator struct {
	ID          int64   `json:"id"`
	Indicator   string  `json:"indicator"`
	Type        string  `json:"type"`
	Created     string  `json:"created"`
	Content     string  `json:"content"`
	Title       string  `json:"title"`
	Description string  `json:"description"`
	Expiration  *string `json:"expiration"`
	IsActive    int     `json:"is_active"`
	Role        *string `json:"role"`

	// Normalised fields
	PulseID   string
	PulseName string
}

type Pulse struct {
	ID                string      `json:"id"`
	Name              string      `json:"name"`
	Description       string      `json:"description"`
	AuthorName        string      `json:"author_name"`
	Modified          string      `json:"modified"`
	Created           string      `json:"created"`
	Revision          int         `json:"revision"`
	TLP               string      `json:"tlp"`
	Public            int         `json:"public"`
	Adversary         string      `json:"adversary"`
	Indicators        []Indicator `json:"indicators"`
	Tags              []string    `json:"tags"`
	TargetedCountries []string    `json:"targeted_countries"`
	MalwareFamilies   []string    `json:"malware_families"`
	AttackIDs         []string    `json:"attack_ids"`
	References        []string    `json:"references"`
	Industries        []string    `json:"industries"`
	ExtractSource     []string    `json:"extract_source"`
	MoreIndicators    bool        `json:"more_indicators"`
}

type OTXResponse struct {
	Results  []Pulse `json:"results"`
	Count    int     `json:"count"`
	Previous string  `json:"previous"`
	Next     *string `json:"next"`
}

func (p Pulse) GetIndicators() []Indicator {
	indicators := make([]Indicator, 0, len(p.Indicators))

	for _, indicator := range p.Indicators {
		if indicator.ID == 0 {
			continue
		}

		indicator.PulseID = p.ID
		indicator.PulseName = p.Name

		indicators = append(indicators, indicator)
	}

	return indicators
}
