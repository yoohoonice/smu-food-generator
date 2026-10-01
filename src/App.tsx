import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  CircleHelp,
  Leaf,
  LockKeyhole,
  LockKeyholeOpen,
  MapPin,
  RotateCcw,
  Search,
  Shuffle,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import {
  cuisineCategoryById,
  cuisineLockCategories,
  type CuisineLockCategory,
} from "../data/food-spot-categories";
import { foodSpots, type FoodSpot, type Suitability } from "../data/food-spots";

const budgets: FoodSpot["priceTier"][] = ["$", "$$", "$$$"];
const vibeGroups = {
  "Casual & Convenient": [
    "Casual",
    "Quick Bite",
    "No-frills",
    "Takeaway",
    "Self-service",
    "Student-friendly",
    "Budget-friendly",
    "Supper Spot",
    "Late Night",
    "24 Hours",
    "Hawker/Food Court",
    "Hawker/Eatery",
    "Modern Food Court",
    "Customizable",
  ],
  "Cozy & Quiet": [
    "Cozy",
    "Chill",
    "Quiet",
    "Peaceful",
    "Relaxed",
    "Zen",
    "Tranquil",
    "Cafe Style",
  ],
  "Lively & Social": [
    "Family-friendly",
    "Lively",
    "Popular",
    "Bustling",
    "Group Dining",
    "Friendly",
    "Nightlife",
    "Vibrant",
  ],
  "Trendy & Stylish": [
    "Youthful",
    "Modern",
    "Chic",
    "Trendy",
    "Minimalist",
    "Instagrammable",
    "Polished",
    "Aesthetic",
    "Hip",
    "Urban",
    "Artistic",
    "Artsy",
    "Luminous",
    "Elegant",
    "Spacious",
    "Industrial Chic",
  ],
  "Classic & Local": [
    "Classic",
    "Authentic",
    "Heritage",
    "Nostalgic",
    "Traditional",
    "Retro",
    "Traditional Kopitiam",
  ],
  "Healthy & Eco-conscious": ["Health-conscious", "Healthy", "Eco-friendly"],
  "Desserts & Treats": ["Sweet Treat"],
  "Special Occasion": ["Casual Fine Dining"],
} as const satisfies Record<string, readonly string[]>;

type VibeGroup = keyof typeof vibeGroups;

function includesDietaryChoice(
  status: Suitability,
  selected: boolean,
  allowNotCertified: boolean,
) {
  if (!selected) return true;
  return status === "YES" || (allowNotCertified && status === "SUITABLE_NOT_CERTIFIED");
}

function suitabilityLabel(status: Suitability) {
  switch (status) {
    case "YES":
      return "Marked suitable in source list";
    case "NO":
      return "Marked not suitable in source list";
    case "SUITABLE_NOT_CERTIFIED":
      return "Suitable, not certified in source list";
    case "UNKNOWN":
      return "Not specified in source list";
  }
}

function App() {
  const [page, setPage] = useState<"filters" | "shortlist">("filters");
  const [search, setSearch] = useState("");
  const [selectedBudgets, setSelectedBudgets] = useState<FoodSpot["priceTier"][]>(budgets);
  const [halalSelected, setHalalSelected] = useState(false);
  const [halalNotCertified, setHalalNotCertified] = useState(false);
  const [vegetarianSelected, setVegetarianSelected] = useState(false);
  const [vegetarianNotCertified, setVegetarianNotCertified] = useState(false);
  const [lockedCuisine, setLockedCuisine] = useState<CuisineLockCategory | "">("");
  const [cuisineIsLocked, setCuisineIsLocked] = useState(false);
  const [selectedVibe, setSelectedVibe] = useState<VibeGroup | "">("");
  const [selectedSpot, setSelectedSpot] = useState<FoodSpot | null>(null);
  const [detailsSpot, setDetailsSpot] = useState<FoodSpot | null>(null);
  const detailsDialog = useRef<HTMLDialogElement>(null);

  const vibeOptions = Object.keys(vibeGroups) as VibeGroup[];

  const filteredSpots = foodSpots.filter((spot) => {
    const searchText = search.trim().toLocaleLowerCase();
    const matchesSearch =
      !searchText ||
      spot.name.toLocaleLowerCase().includes(searchText) ||
      spot.location.toLocaleLowerCase().includes(searchText);
    const matchesBudget = selectedBudgets.includes(spot.priceTier);
    const matchesHalal = includesDietaryChoice(
      spot.dietary.halal,
      halalSelected,
      halalNotCertified,
    );
    const matchesVegetarian = includesDietaryChoice(
      spot.dietary.vegetarian,
      vegetarianSelected,
      vegetarianNotCertified,
    );
    const matchesCuisine =
      !cuisineIsLocked ||
      !lockedCuisine ||
      cuisineCategoryById[spot.id] === lockedCuisine;
    const matchesVibe =
      !selectedVibe ||
      spot.vibes.some((vibe) =>
        (vibeGroups[selectedVibe] as readonly string[]).includes(vibe),
      );

    return (
      matchesSearch &&
      matchesBudget &&
      matchesHalal &&
      matchesVegetarian &&
      matchesCuisine &&
      matchesVibe
    );
  });

  useEffect(() => {
    const dialog = detailsDialog.current;
    if (detailsSpot && dialog && !dialog.open) dialog.showModal();
    if (!detailsSpot && dialog?.open) dialog.close();
  }, [detailsSpot]);

  function toggleBudget(budget: FoodSpot["priceTier"]) {
    setSelectedBudgets((current) =>
      current.includes(budget)
        ? current.filter((item) => item !== budget)
        : [...current, budget],
    );
  }

  function shuffleSpot() {
    if (filteredSpots.length === 0) return;
    const alternatives = filteredSpots.filter((spot) => spot.id !== selectedSpot?.id);
    const pool = alternatives.length > 0 ? alternatives : filteredSpots;
    setSelectedSpot(pool[Math.floor(Math.random() * pool.length)]);
  }

  function goToShortlist() {
    if (filteredSpots.length === 0) return;
    setSelectedSpot(filteredSpots[Math.floor(Math.random() * filteredSpots.length)]);
    setPage("shortlist");
  }

  function resetFilters() {
    setSearch("");
    setSelectedBudgets(budgets);
    setHalalSelected(false);
    setHalalNotCertified(false);
    setVegetarianSelected(false);
    setVegetarianNotCertified(false);
    setLockedCuisine("");
    setCuisineIsLocked(false);
    setSelectedVibe("");
  }

  function updateDietSelection(diet: "halal" | "vegetarian", selected: boolean) {
    if (diet === "halal") {
      setHalalSelected(selected);
      if (!selected) setHalalNotCertified(false);
    } else {
      setVegetarianSelected(selected);
      if (!selected) setVegetarianNotCertified(false);
    }
  }

  function updateNotCertified(diet: "halal" | "vegetarian", selected: boolean) {
    if (diet === "halal") setHalalNotCertified(selected);
    else setVegetarianNotCertified(selected);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="SMU Food Spot Generator home">
          <span className="brand-mark" aria-hidden="true">
            <Utensils size={18} strokeWidth={2.2} />
          </span>
          <span className="brand-name">SMU <b>FOOD FINDER</b></span>
        </a>
        <div className="campus-indicator">
          <span className="status-dot" />
          <span>Singapore Management University</span>
        </div>
      </header>

      <section className="page-heading" id="top">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> YOUR NEXT MEAL, DECIDED</p>
          <h1>{page === "filters" ? "What sounds good?" : "Your shortlist"}</h1>
          <p className="heading-copy">
            {page === "filters"
              ? "Explore a new food gem today!"
              : "A fresh pick from the spots that fit."}
          </p>
        </div>
        <div className="heading-stamp" aria-hidden="true">
          <span>100</span>
          <small>SPOTS<br />IN THE MIX</small>
        </div>
      </section>

      <div className={`workspace ${page === "shortlist" ? "shortlist-workspace" : ""}`}>
        {page === "filters" && (
        <aside className="filter-panel" aria-label="Food spot filters">
          <div className="panel-heading">
            <div>
              <p className="section-kicker">MAKE IT YOURS</p>
              <h2>Filters</h2>
            </div>
            <button className="text-button" type="button" onClick={resetFilters}>
              <RotateCcw size={14} /> Reset
            </button>
          </div>

          <label className="search-field">
            <Search size={17} aria-hidden="true" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search places or areas"
              aria-label="Search food spots by name or location"
            />
          </label>

          <fieldset className="filter-group budget-group">
            <legend>Budget</legend>
            <div className="budget-options">
              {budgets.map((budget) => (
                <button
                  className={`budget-option ${selectedBudgets.includes(budget) ? "is-selected" : ""}`}
                  key={budget}
                  type="button"
                  aria-pressed={selectedBudgets.includes(budget)}
                  onClick={() => toggleBudget(budget)}
                >
                  {budget}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="filter-group dietary-group">
            <legend>Dietary</legend>
            <DietaryFilter
              id="halal"
              label="Halal"
              icon={<span className="dietary-letter" aria-hidden="true">H</span>}
              selected={halalSelected}
              includeNotCertified={halalNotCertified}
              onSelectedChange={(value) => updateDietSelection("halal", value)}
              onNotCertifiedChange={(value) => updateNotCertified("halal", value)}
            />
            <DietaryFilter
              id="vegetarian"
              label="Vegetarian"
              icon={<Leaf size={17} aria-hidden="true" />}
              selected={vegetarianSelected}
              includeNotCertified={vegetarianNotCertified}
              onSelectedChange={(value) => updateDietSelection("vegetarian", value)}
              onNotCertifiedChange={(value) => updateNotCertified("vegetarian", value)}
            />
            <p className="filter-note">The source list may not reflect current menus or certification.</p>
          </fieldset>

          <fieldset className="filter-group select-group">
            <legend>Cuisine lock</legend>
            <div className="select-row">
              <label className="select-wrap">
                <span className="sr-only">Choose a cuisine to lock</span>
                <select
                  value={lockedCuisine}
                  onChange={(event) => {
                    const selectedCategory = cuisineLockCategories.find(
                      (category) => category === event.target.value,
                    );
                    setLockedCuisine(selectedCategory ?? "");
                  }}
                  onBlur={(event) => {
                    if (!event.target.value) setCuisineIsLocked(false);
                  }}
                >
                  <option value="">Any cuisine</option>
                  {cuisineLockCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
              <button
                className={`icon-button lock-button ${cuisineIsLocked ? "is-locked" : ""}`}
                type="button"
                disabled={!lockedCuisine}
                aria-label={cuisineIsLocked ? "Unlock cuisine filter" : "Lock selected cuisine"}
                aria-pressed={cuisineIsLocked}
                title={cuisineIsLocked ? "Unlock cuisine" : "Lock selected cuisine"}
                onClick={() => setCuisineIsLocked((value) => !value)}
              >
                {cuisineIsLocked ? <LockKeyhole size={17} /> : <LockKeyholeOpen size={17} />}
              </button>
            </div>
          </fieldset>

          <fieldset className="filter-group select-group last-filter">
            <legend>Vibe</legend>
            <label className="select-wrap full-select">
              <span className="sr-only">Filter by vibe</span>
              <select
                value={selectedVibe}
                onChange={(event) => {
                  const selectedGroup = vibeOptions.find(
                    (group) => group === event.target.value,
                  );
                  setSelectedVibe(selectedGroup ?? "");
                }}
              >
                <option value="">Any vibe</option>
                {vibeOptions.map((group) => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
              <ChevronDown size={16} aria-hidden="true" />
            </label>
          </fieldset>

          <div className="filter-footer">
            <span>{filteredSpots.length} spots match</span>
            <CircleHelp size={15} aria-label="Dietary details come from the provided source list" />
          </div>
        </aside>
        )}

        <section
          className={`results-panel ${page === "shortlist" ? "shortlist-results" : ""}`}
          aria-label={page === "shortlist" ? "Shuffled food spot shortlist" : "Filter matches"}
        >
          {page === "shortlist" && (
            <button className="back-button" type="button" onClick={() => setPage("filters")}>
              <ArrowLeft size={16} /> Back to filters
            </button>
          )}
          <div className="results-topline">
            <div>
              <p className="section-kicker">
                {page === "shortlist" ? "THE SHORTLIST" : "FILTER MATCHES"}
              </p>
              <h2>{page === "shortlist" ? "Your next meal." : "Ready for a pick?"}</h2>
            </div>
            <span className="result-count" aria-live="polite">
              {filteredSpots.length} MATCHES
            </span>
          </div>

          {filteredSpots.length === 0 ? (
            <div className="empty-state" role="status">
              <div className="empty-icon"><Search size={22} /></div>
              <h3>No spots match those filters.</h3>
              <p>Try widening your search or clearing a filter.</p>
              <button className="secondary-button" type="button" onClick={resetFilters}>Clear filters</button>
            </div>
          ) : page === "shortlist" && selectedSpot ? (
            <article className="spot-card" key={selectedSpot.id}>
              <div className="spot-card-top">
                <span className="spot-index"><Check size={13} /> YOUR PICK</span>
                <button
                  className="details-button"
                  type="button"
                  onClick={() => setDetailsSpot(selectedSpot)}
                >
                  Details <ArrowUpRight size={15} />
                </button>
              </div>
              <div className="spot-card-content">
                <div className="spot-symbol" aria-hidden="true"><Utensils size={27} /></div>
                <p className="spot-location"><MapPin size={14} /> {selectedSpot.location}</p>
                <h3>{selectedSpot.name}</h3>
                <div className="spot-meta">
                  <span className="price-tag">{selectedSpot.priceTier}</span>
                  <span className="meta-tag">{cuisineCategoryById[selectedSpot.id]}</span>
                  {selectedSpot.cuisines.slice(0, 2).map((cuisine) => (
                    <span className="meta-tag" key={cuisine}>{cuisine}</span>
                  ))}
                  {selectedSpot.vibes.slice(0, 1).map((vibe) => (
                    <span className="meta-tag meta-tag-muted" key={vibe}>{vibe}</span>
                  ))}
                </div>
              </div>
              <div className="spot-card-bottom">
                <span>Selected from {filteredSpots.length} matching spots</span>
                {selectedSpot.googleMapsUrls[0] && (
                  <a href={selectedSpot.googleMapsUrls[0]} target="_blank" rel="noreferrer">
                    Map <ArrowUpRight size={14} />
                  </a>
                )}
              </div>
            </article>
          ) : page === "filters" ? (
            <div className="ready-state">
              <div className="ready-art" aria-hidden="true">
                <span className="ready-ring ready-ring-one" />
                <span className="ready-ring ready-ring-two" />
                <span className="ready-center"><Utensils size={29} /></span>
                <span className="ready-spark ready-spark-one">✳</span>
                <span className="ready-spark ready-spark-two">✳</span>
              </div>
              <p>{filteredSpots.length} places fit your filters.<br />Ready for a pick?</p>
              <span className="ready-hint">YOUR FILTERS ARE SET</span>
            </div>
          ) : null}

          <div className="shuffle-row">
            <button
              className="shuffle-button"
              type="button"
              disabled={filteredSpots.length === 0}
              onClick={page === "filters" ? goToShortlist : shuffleSpot}
            >
              {page === "filters" ? <ArrowRight size={17} /> : <Shuffle size={17} />}
              {page === "filters" ? "Next" : "Shuffle again"}
            </button>
          </div>
          <p className="source-note">Dietary details are from the source list. Please confirm directly with the venue.</p>
        </section>
      </div>

      <footer className="page-footer">
        <span>SMU FOOD FINDER</span>
        <span>Built for the “where should we eat?” moment.</span>
      </footer>

      <dialog
        className="details-dialog"
        ref={detailsDialog}
        aria-labelledby="details-title"
        onClose={() => setDetailsSpot(null)}
        onClick={(event) => {
          if (event.target === detailsDialog.current) setDetailsSpot(null);
        }}
      >
        {detailsSpot && (
          <div className="dialog-content">
            <div className="dialog-topline">
              <span className="section-kicker">SPOT DETAILS</span>
              <button className="icon-button" type="button" aria-label="Close details" onClick={() => setDetailsSpot(null)}>
                <X size={18} />
              </button>
            </div>
            <p className="spot-location"><MapPin size={14} /> {detailsSpot.location}</p>
            <h2 id="details-title">{detailsSpot.name}</h2>
            <p className="dialog-price">Price tier <strong>{detailsSpot.priceTier}</strong></p>
            <div className="dialog-section">
              <h3>Cuisine</h3>
              <div className="dialog-tags">{detailsSpot.cuisines.map((item) => <span className="meta-tag" key={item}>{item}</span>)}</div>
            </div>
            <div className="dialog-section">
              <h3>Dietary from source list</h3>
              <p>Halal: {suitabilityLabel(detailsSpot.dietary.halal)}</p>
              <p>Vegetarian: {suitabilityLabel(detailsSpot.dietary.vegetarian)}</p>
            </div>
            <div className="dialog-section">
              <h3>Vibe</h3>
              <div className="dialog-tags">{detailsSpot.vibes.map((item) => <span className="meta-tag" key={item}>{item}</span>)}</div>
            </div>
            <div className="dialog-links">
              {detailsSpot.googleMapsUrls.map((url, index) => (
                <a href={url} target="_blank" rel="noreferrer" key={url}>
                  {detailsSpot.googleMapsUrls.length > 1 ? `Map ${index + 1}` : "Open in Google Maps"}
                  <ArrowUpRight size={15} />
                </a>
              ))}
            </div>
          </div>
        )}
      </dialog>
    </main>
  );
}

type DietaryFilterProps = {
  id: string;
  label: string;
  icon: ReactNode;
  selected: boolean;
  includeNotCertified: boolean;
  onSelectedChange: (selected: boolean) => void;
  onNotCertifiedChange: (selected: boolean) => void;
};

function DietaryFilter({
  id,
  label,
  icon,
  selected,
  includeNotCertified,
  onSelectedChange,
  onNotCertifiedChange,
}: DietaryFilterProps) {
  return (
    <div className={`dietary-option ${selected ? "is-active" : ""}`}>
      <label className="dietary-main" htmlFor={`${id}-selected`}>
        <span className="dietary-icon">{icon}</span>
        <span>{label}</span>
        <input
          id={`${id}-selected`}
          type="checkbox"
          checked={selected}
          onChange={(event) => onSelectedChange(event.target.checked)}
        />
      </label>
      {selected && (
        <label className="uncertified-option" htmlFor={`${id}-uncertified`}>
          <input
            id={`${id}-uncertified`}
            type="checkbox"
            checked={includeNotCertified}
            onChange={(event) => onNotCertifiedChange(event.target.checked)}
          />
          Include suitable, not certified
        </label>
      )}
    </div>
  );
}

export default App;