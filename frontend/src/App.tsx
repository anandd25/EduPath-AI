import { useState } from "react";
import type { StudentProfile } from "./types";
import {
  generatePathways,
  simulateScenario,
} from "./api";

function App() {
  const [profile, setProfile] = useState<StudentProfile>({
  name: "",
  country: "India",
  grade: 10,
  subjects: [
    "Mathematics",
    "Science",
    "English",
  ],
  marks: 85,
  budgetAnnual: 10000,
  currency: "USD",
  locationPreference: "flexible",
  interests: [
    "AI",
    "Computer Science",
  ],
  preferredCountries: [
    "India",
    "Canada",
    "Germany",
  ],
  financialAid: true,
});

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [scenario, setScenario] = useState(
    "What if I don't get MBBS?"
  );

  const [scenarioResult, setScenarioResult] =
    useState<any>(null);

  const [scenarioLoading, setScenarioLoading] =
    useState(false);

  async function handleGenerate() {
    setLoading(true);

    try {
      const data = await generatePathways(profile);
      setResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function handleScenario() {
    setScenarioLoading(true);

    try {
      const data = await simulateScenario(
        profile,
        scenario
      );

      setScenarioResult(data);
    } catch (error) {
      console.error(error);
    } finally {
      setScenarioLoading(false);
    }
  }

  return (
    <div className="app-shell">

      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <header className="topbar">
        <div>
          <div className="eyebrow">
            HACKMATRIX 5.0
          </div>

          <h1>
            EduPath AI
          </h1>

          <p>
            Explore education and career pathways
            without reducing your future to one answer.
          </p>
        </div>

        <div className="status-pill">
          ● Decision Support
        </div>
      </header>


      {/* ================================================= */}
      {/* PROFILE */}
      {/* ================================================= */}

      <section className="panel">

        <div className="section-heading">
          <div>
            <span className="section-kicker">
              STEP 01
            </span>

            <h2>
              Build your student profile
            </h2>

            <p>
              Add academic, financial and interest
              information to compare possible pathways.
            </p>
          </div>
        </div>


        <div className="form-grid">

          <label>
            Name

            <input
              value={profile.name}
              placeholder="Student name"
              onChange={(e) =>
                setProfile({
                  ...profile,
                  name: e.target.value,
                })
              }
            />
          </label>


          <label>
            Marks %

            <input
              type="number"
              min="0"
              max="100"
              value={profile.marks}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  marks: Number(e.target.value),
                })
              }
            />
          </label>


          <label>
            Annual Budget

            <input
              type="number"
              min="0"
              value={profile.budgetAnnual}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  budgetAnnual: Number(
                    e.target.value
                  ),
                })
              }
            />
          </label>


          <label>
            Currency

            <select
              value={profile.currency}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  currency: e.target.value,
                })
              }
            >
              <option value="USD">
                USD
              </option>

              <option value="INR">
                INR
              </option>

              <option value="GBP">
                GBP
              </option>

              <option value="CAD">
                CAD
              </option>

              <option value="EUR">
                EUR
              </option>
            </select>
          </label>


          <label>
          Location Preference

          <select
            value={profile.locationPreference}
            onChange={(e) =>
              setProfile({
                ...profile,
                locationPreference:
                  e.target.value as StudentProfile["locationPreference"],
              })
            }
          >
            <option value="home">
              Home country
            </option>

            <option value="abroad">
              Abroad
            </option>

            <option value="flexible">
              Flexible
            </option>
          </select>
        </label>


          <label>
            Interests

            <input
              value={profile.interests.join(", ")}
              placeholder="AI, Medicine, Business"
              onChange={(e) =>
                setProfile({
                  ...profile,
                  interests: e.target.value
                    .split(",")
                    .map((x) => x.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>


          <label>
            Preferred Countries

            <input
              value={profile.preferredCountries.join(
                ", "
              )}
              placeholder="India, Canada, Germany"
              onChange={(e) =>
                setProfile({
                  ...profile,
                  preferredCountries:
                    e.target.value
                      .split(",")
                      .map((x) => x.trim())
                      .filter(Boolean),
                })
              }
            />
          </label>


          <label className="checkbox-row">

            <input
              type="checkbox"
              checked={profile.financialAid}
              onChange={(e) =>
                setProfile({
                  ...profile,
                  financialAid:
                    e.target.checked,
                })
              }
            />

            Consider scholarships and financial aid

          </label>

        </div>


        <button
          className="primary-button"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading
            ? "Building pathways..."
            : "Build pathway map"}
        </button>

      </section>


      {/* ================================================= */}
      {/* PATHWAYS */}
      {/* ================================================= */}

      {result && (
        <section className="panel">

          <div className="section-heading">

            <div>
              <span className="section-kicker">
                STEP 02
              </span>

              <h2>
                Your pathway map
              </h2>

              <p>
                Compare multiple routes instead of
                relying on a single recommendation.
              </p>
            </div>

          </div>


          <div className="pathway-grid">

            {result.pathways?.map(
              (pathway: any) => (

                <article
                  className="path-card"
                  key={pathway.id}
                >

                  <div className="path-card-top">

                    <span className="category-pill">
                      PATHWAY
                    </span>

                    <span className="fit-score">
                      {pathway.fit}/100
                    </span>

                  </div>


                  <h3>
                    {pathway.title}
                  </h3>


                  <p>
                    {pathway.route}
                  </p>


                  <div className="path-meta">

                    <div>
                      <strong>
                        Duration
                      </strong>

                      <span>
                        {pathway.durationYears} years
                      </span>
                    </div>


                    <div>
                      <strong>
                        Cost
                      </strong>

                      <span>
                        {pathway.estimatedCost}
                      </span>
                    </div>

                  </div>


                  <div className="tag-list">

                    {pathway.countries?.map(
                      (country: string) => (
                        <span
                          className="tag"
                          key={country}
                        >
                          {country}
                        </span>
                      )
                    )}

                  </div>


                  <div className="detail-block">

                    <strong>
                      Why it appears
                    </strong>

                    <ul>

                      {pathway.rationale?.map(
                        (
                          item: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>


                  <div className="detail-block">

                    <strong>
                      Admissions
                    </strong>

                    <ul>

                      {pathway.admission?.map(
                        (
                          item: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>


                  <div className="detail-block">

                    <strong>
                      Possible careers
                    </strong>

                    <ul>

                      {pathway.careers?.map(
                        (
                          item: string,
                          index: number
                        ) => (
                          <li key={index}>
                            {item}
                          </li>
                        )
                      )}

                    </ul>

                  </div>


                  <div className="uncertainty-box">

                    <strong>
                      Assumptions & uncertainty
                    </strong>

                    {pathway.assumptions?.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <p key={`a-${index}`}>
                          • {item}
                        </p>
                      )
                    )}

                    {pathway.uncertainty?.map(
                      (
                        item: string,
                        index: number
                      ) => (
                        <p key={`u-${index}`}>
                          ⚠ {item}
                        </p>
                      )
                    )}

                  </div>

                </article>

              )
            )}

          </div>


          {/* ================================================= */}
          {/* DECISION MATRIX */}
          {/* ================================================= */}

          {result.matrix && (
            <div className="matrix-section">

              <h2>
                Decision matrix
              </h2>

              <p>
                Compare the pathways across several
                dimensions rather than producing a
                single winner.
              </p>


              <div className="table-wrapper">

                <table>

                  <thead>

                    <tr>

                      <th>
                        Pathway
                      </th>

                      {result.matrix.criteria?.map(
                        (criterion: string) => (
                          <th key={criterion}>
                            {criterion}
                          </th>
                        )
                      )}

                    </tr>

                  </thead>


                  <tbody>

                    {result.matrix.rows?.map(
                      (row: any) => (

                        <tr key={row.pathway}>

                          <td>
                            <strong>
                              {row.pathway}
                            </strong>
                          </td>

                          {result.matrix.criteria?.map(
                            (criterion: string) => (

                              <td
                                key={criterion}
                              >
                                {
                                  row.values?.[
                                    criterion
                                  ] ?? "—"
                                }
                              </td>

                            )
                          )}

                        </tr>

                      )
                    )}

                  </tbody>

                </table>

              </div>

            </div>
          )}

        </section>
      )}


      {/* ================================================= */}
      {/* WHAT IF */}
      {/* ================================================= */}

      <section className="panel">

        <div className="section-heading">

          <div>

            <span className="section-kicker">
              STEP 03
            </span>

            <h2>
              What-if lab
            </h2>

            <p>
              Explore alternatives when the original
              plan changes.
            </p>

          </div>

        </div>


        <div className="scenario-box">

          <label>
            Scenario

            <textarea
              value={scenario}
              onChange={(e) =>
                setScenario(e.target.value)
              }
              rows={3}
            />

          </label>


          <button
            className="secondary-button"
            onClick={handleScenario}
            disabled={scenarioLoading}
          >
            {scenarioLoading
              ? "Simulating..."
              : "Run what-if scenario"}
          </button>

        </div>


        {scenarioResult && (

          <div className="scenario-result">

            <h3>
              {scenarioResult.scenario}
            </h3>

            <p>
              {scenarioResult.summary}
            </p>


            <div className="scenario-options">

              {scenarioResult.options?.map(
                (
                  option: any,
                  index: number
                ) => (

                  <article
                    className="scenario-card"
                    key={index}
                  >

                    <h4>
                      {option.pathway}
                    </h4>

                    <p>
                      <strong>
                        Why:
                      </strong>{" "}
                      {option.reason}
                    </p>

                    <p>
                      <strong>
                        Tradeoff:
                      </strong>{" "}
                      {option.tradeoff}
                    </p>

                  </article>

                )
              )}

            </div>


            {scenarioResult.assumptions && (

              <div className="uncertainty-box">

                <strong>
                  Assumptions
                </strong>

                {scenarioResult.assumptions.map(
                  (
                    item: string,
                    index: number
                  ) => (
                    <p key={index}>
                      • {item}
                    </p>
                  )
                )}

              </div>

            )}

          </div>

        )}

      </section>


      {/* ================================================= */}
      {/* FOOTER */}
      {/* ================================================= */}

      <footer>

        <p>
          EduPath AI — decision support, not a
          single prescribed career choice.
        </p>

      </footer>

    </div>
  );
}

export default App;