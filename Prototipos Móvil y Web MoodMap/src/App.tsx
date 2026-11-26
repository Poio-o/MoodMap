import {
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

type View = "map" | "detail" | "review";
type IconName =
  | "alert"
  | "arrow"
  | "bell"
  | "check"
  | "chevron"
  | "clock"
  | "close"
  | "filter"
  | "group"
  | "home"
  | "light"
  | "location"
  | "map"
  | "minus"
  | "moon"
  | "noise"
  | "plus"
  | "search"
  | "star"
  | "sun"
  | "tree"
  | "user";

const iconPaths: Record<IconName, ReactNode> = {
  alert: (
    <>
      <path d="M10.3 4.5 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.5a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </>
  ),
  arrow: <path d="m15 18-6-6 6-6" />,
  bell: <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" />,
  check: <path d="m5 12 4 4L19 6" />,
  chevron: <path d="m9 18 6-6-6-6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  close: <path d="m6 6 12 12M18 6 6 18" />,
  filter: <path d="M4 7h10M18 7h2M4 17h2M10 17h10M14 4v6M6 14v6" />,
  group: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  home: (
    <>
      <path d="m3 11 9-8 9 8" />
      <path d="M5 10v10h14V10M9 20v-6h6v6" />
    </>
  ),
  light: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
    </>
  ),
  location: (
    <>
      <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </>
  ),
  map: (
    <>
      <path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z" />
      <path d="M9 3v15M15 6v15" />
    </>
  ),
  minus: <path d="M6 12h12" />,
  moon: <path d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5 8.5 8.5 0 1 0 20.5 14.2Z" />,
  noise: (
    <>
      <path d="M11 5 6 9H3v6h3l5 4Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  star: <path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  tree: (
    <>
      <path d="m12 3-5 7h3l-4 6h12l-4-6h3Z" />
      <path d="M12 16v5" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
};

function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name]}
    </svg>
  );
}

const places = [
  {
    name: "Café Calma",
    type: "Cafetería",
    distance: "250 m",
    score: "4,8",
    color: "#4f78a8",
    busy: "Bajo",
    kind: "local",
    description: "Interior silencioso y mesas separadas.",
  },
  {
    name: "Biblioteca Norte",
    type: "Biblioteca",
    distance: "600 m",
    score: "4,6",
    color: "#80694d",
    busy: "Muy bajo",
    kind: "local",
    description: "Zona de lectura con iluminación indirecta.",
  },
  {
    name: "Mercado Central",
    type: "Comercio",
    distance: "1,2 km",
    score: "3,2",
    color: "#b76551",
    busy: "Alto",
    kind: "local",
    description: "Mayor afluencia cerca de los accesos.",
  },
  {
    name: "Paseo del Olmo",
    type: "Zona de calle",
    distance: "450 m",
    score: "4,3",
    color: "#4c7fa0",
    busy: "Moderado",
    kind: "zone",
    description: "Tramo con tráfico y ruido variable entre las 17:00 y las 20:00.",
  },
  {
    name: "Parque de la Estación",
    type: "Parque",
    distance: "900 m",
    score: "4,7",
    color: "#527da9",
    busy: "Muy bajo",
    kind: "zone",
    description: "Área arbolada tranquila, salvo cerca de la zona infantil.",
  },
];

const sensory = [
  { icon: "noise" as IconName, label: "Ruido", level: "Bajo", value: 30, color: "#5d83ad" },
  { icon: "light" as IconName, label: "Iluminación", level: "Suave", value: 46, color: "#c79856" },
  {
    icon: "group" as IconName,
    label: "Aglomeración",
    level: "Muy baja",
    value: 20,
    color: "#6f8aa3",
  },
];

function Logo() {
  return (
    <button
      className="logo"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="MoodMap, inicio"
    >
      <span className="logo-mark">
        <span />
      </span>
      <span>MoodMap</span>
    </button>
  );
}

function SideNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <aside className="side-nav">
      <Logo />
      <nav aria-label="Navegación principal">
        <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
          <Icon name="map" /> Explorar mapa
        </button>
        <button className={view === "detail" ? "active" : ""} onClick={() => setView("detail")}>
          <Icon name="home" /> Mis lugares
        </button>
        <button className={view === "review" ? "active" : ""} onClick={() => setView("review")}>
          <Icon name="plus" /> Añadir valoración
        </button>
      </nav>
      <div className="side-bottom">
        <div className="community-card">
          <span className="community-icon">
            <Icon name="group" size={18} />
          </span>
          <strong>Tu experiencia ayuda</strong>
          <p>Comparte cómo se siente un lugar para hacer la ciudad más accesible.</p>
          <button onClick={() => setView("review")}>Valorar un lugar</button>
        </div>
        <button className="profile">
          <span className="avatar">LM</span>
          <span>
            <strong>Lucía Martín</strong>
            <small>Ver perfil</small>
          </span>
          <Icon name="chevron" size={17} />
        </button>
      </div>
    </aside>
  );
}

function Header({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="top-header">
      <div className="mobile-logo">
        <Logo />
      </div>
      <div className="page-heading">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      <div className="header-actions">
        <button className="round-button" aria-label="Notificaciones">
          <Icon name="bell" />
        </button>
        <span className="avatar">LM</span>
      </div>
    </header>
  );
}

function PlaceCard({
  place,
  active,
  onClick,
}: {
  place: (typeof places)[number];
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`place-card ${active ? "selected" : ""}`} onClick={onClick}>
      <span className="place-photo" style={{ "--place-color": place.color } as React.CSSProperties}>
        {place.kind === "local" ? (
          <>
            <span className="awning" />
            <span className="shop-window" />
          </>
        ) : (
          <span className="area-thumbnail">
            <Icon name={place.type === "Parque" ? "tree" : "map"} size={22} />
          </span>
        )}
      </span>
      <span className="place-copy">
        <span className="place-topline">
          <strong>{place.name}</strong>
          <span>
            <Icon name="star" size={14} /> {place.score}
          </span>
        </span>
        <span className="muted">
          {place.type} · {place.distance}
        </span>
        <span className={`status ${place.busy === "Alto" ? "high" : ""}`}>
          <i /> {place.busy} ahora
        </span>
      </span>
      <Icon name="chevron" className="card-chevron" size={18} />
    </button>
  );
}

function MapArtwork({
  selected,
  onSelect,
}: {
  selected: number;
  onSelect: (index: number) => void;
}) {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<{ x: number; y: number; startX: number; startY: number } | null>(
    null,
  );

  const startDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button")) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: offset.x, y: offset.y, startX: event.clientX, startY: event.clientY });
  };

  const moveMap = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    setOffset({
      x: Math.max(-90, Math.min(90, drag.x + event.clientX - drag.startX)),
      y: Math.max(-70, Math.min(70, drag.y + event.clientY - drag.startY)),
    });
  };

  return (
    <div
      className={`map-art ${drag ? "dragging" : ""}`}
      aria-label="Mapa interactivo de establecimientos y zonas cercanas. Arrastra para moverlo."
      onPointerDown={startDrag}
      onPointerMove={moveMap}
      onPointerUp={() => setDrag(null)}
      onPointerCancel={() => setDrag(null)}
    >
      <div
        className="map-canvas"
        style={{ transform: `translate3d(${offset.x}px, ${offset.y}px, 0)` }}
      >
        <div className="river" />
        <div className="road r1" />
        <div className="road r2" />
        <div className="road r3" />
        <div className="road r4" />
        <div className="park park-a">
          <span />
          <span />
          <span />
        </div>
        <div className="park park-b">
          <span />
          <span />
        </div>
        <div className="map-label label-a">JARDINES DE VELÁZQUEZ</div>
        <div className="map-label label-b">AVENIDA DEL PARQUE</div>
        <button
          className={`sensory-zone zone-street ${selected === 3 ? "selected" : ""}`}
          onClick={() => onSelect(3)}
          aria-label="Seleccionar zona Paseo del Olmo"
        >
          <span className="zone-shape" />
          <strong>
            <Icon name="noise" size={14} /> Paseo del Olmo
            <small>Ruido moderado</small>
          </strong>
        </button>
        <button
          className={`sensory-zone zone-park ${selected === 4 ? "selected" : ""}`}
          onClick={() => onSelect(4)}
          aria-label="Seleccionar Parque de la Estación"
        >
          <span className="zone-shape" />
          <strong>
            <Icon name="tree" size={14} /> Parque de la Estación
            <small>Zona tranquila</small>
          </strong>
        </button>
        {places.slice(0, 3).map((place, index) => (
          <button
            key={place.name}
            className={`map-pin pin-${index + 1} ${selected === index ? "selected" : ""}`}
            onClick={() => onSelect(index)}
            aria-label={`Seleccionar ${place.name}`}
          >
            <span>
              <Icon name={index === 1 ? "home" : index === 2 ? "group" : "noise"} size={17} />
            </span>
            {selected === index && (
              <strong>
                {place.name}
                <small>{place.busy} ahora</small>
              </strong>
            )}
          </button>
        ))}
        <div className="user-dot">
          <span />
        </div>
      </div>
      <span className="drag-hint">
        <Icon name="map" size={14} /> Arrastra para explorar
      </span>
      <div className="map-tools">
        <button aria-label="Acercar">
          <Icon name="plus" size={18} />
        </button>
        <button aria-label="Alejar">
          <Icon name="minus" size={18} />
        </button>
        <button aria-label="Mi ubicación">
          <Icon name="location" size={18} />
        </button>
      </div>
      <div className="map-key">
        <span>
          <i className="calm" /> Tranquilo
        </span>
        <span>
          <i className="medium" /> Moderado
        </span>
        <span>
          <i className="busy" /> Intenso
        </span>
        <span className="zone-key">
          <i /> Zona afectada
        </span>
      </div>
    </div>
  );
}

function MapView({ setView }: { setView: (view: View) => void }) {
  const [selected, setSelected] = useState(0);
  const [filter, setFilter] = useState("Todos");
  const filteredPlaces =
    filter === "Todos"
      ? places
      : filter === "Zonas abiertas"
        ? places.filter((place) => place.kind === "zone")
        : places.filter((place) => place.type.includes(filter.slice(0, -1)));

  return (
    <div className="view-shell">
      <Header
        title="Encuentra tu espacio tranquilo"
        subtitle="Consulta las condiciones sensoriales antes de salir."
      />
      <main className="explore-layout">
        <section className="results-panel">
          <div className="search-box">
            <Icon name="search" />
            <input aria-label="Buscar lugar" placeholder="Busca una cafetería, biblioteca..." />
            <button aria-label="Filtros">
              <Icon name="filter" size={18} />
            </button>
          </div>
          <div className="filter-row">
            {["Todos", "Cafeterías", "Bibliotecas", "Comercios", "Zonas abiertas"].map((item) => (
              <button
                className={filter === item ? "active" : ""}
                onClick={() => setFilter(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="result-title">
            <span>
              <strong>16 lugares y zonas cerca</strong>
              <small>Locales, calles y espacios abiertos</small>
            </span>
            <button>Ver lista</button>
          </div>
          <div className="cards-list">
            {filteredPlaces.map((place) => {
              const index = places.indexOf(place);
              return (
                <PlaceCard
                  key={place.name}
                  place={place}
                  active={selected === index}
                  onClick={() => {
                    setSelected(index);
                    if (window.innerWidth < 768 && place.kind === "local") setView("detail");
                  }}
                />
              );
            })}
          </div>
        </section>
        <section className="map-panel">
          <MapArtwork selected={selected} onSelect={setSelected} />
          <button
            className="floating-detail"
            onClick={() => setView(selected < 3 ? "detail" : "review")}
          >
            <span>
              <strong>{places[selected].name}</strong>
              <small>
                {places[selected].type} · {places[selected].distance}
              </small>
            </span>
            <span className="detail-score">
              <Icon name="star" size={14} /> {places[selected].score}
            </span>
            <Icon name="chevron" size={18} />
          </button>
        </section>
      </main>
    </div>
  );
}

function SensoryCard({ item }: { item: (typeof sensory)[number] }) {
  return (
    <div className="sensory-card">
      <span className="sensory-icon" style={{ color: item.color }}>
        <Icon name={item.icon} />
      </span>
      <div>
        <small>{item.label}</small>
        <strong>{item.level}</strong>
      </div>
      <div className="meter">
        <span style={{ width: `${item.value}%`, background: item.color }} />
      </div>
    </div>
  );
}

function DetailView({ setView }: { setView: (view: View) => void }) {
  const [reportOpen, setReportOpen] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [reportReason, setReportReason] = useState("Ruido");

  return (
    <div className="view-shell detail-view">
      <Header title="Ficha del establecimiento" />
      <main className="detail-content">
        <button className="back-link" onClick={() => setView("map")}>
          <Icon name="arrow" size={18} /> Volver al mapa
        </button>
        <div className="detail-grid">
          <section>
            <div className="hero-place">
              <div className="hero-shape shape-one" />
              <div className="hero-shape shape-two" />
              <span className="hero-sign">CAFÉ CALMA</span>
              <span className="hero-door" />
              <span className="hero-window" />
              <span className="verified">
                <Icon name="check" size={14} /> Información verificada
              </span>
            </div>
            <div className="place-title">
              <div>
                <span className="eyebrow">CAFETERÍA</span>
                <h2>Café Calma</h2>
                <p>
                  <Icon name="location" size={16} /> Calle de la Paz, 18 · A 250 m
                </p>
              </div>
              <div className="large-score">
                <Icon name="star" size={19} />
                <strong>4,8</strong>
                <small>124 valoraciones</small>
              </div>
            </div>
            <div className="section-head">
              <div>
                <h3>Ambiente sensorial</h3>
                <p>Basado en 48 valoraciones recientes</p>
              </div>
              <span className="updated">
                <i /> Actualizado hoy
              </span>
            </div>
            <div className="sensory-grid">
              {sensory.map((item) => (
                <SensoryCard key={item.label} item={item} />
              ))}
            </div>
            <div className="community-note">
              <span>
                <Icon name="check" />
              </span>
              <div>
                <strong>Alta fiabilidad</strong>
                <p>El 92% de la comunidad confirma estas condiciones.</p>
              </div>
              <button onClick={() => setReportOpen(!reportOpen)}>
                <Icon name="alert" size={15} /> No estoy de acuerdo
              </button>
            </div>
            {reportOpen && (
              <div className="dispute-panel">
                {reportSent ? (
                  <div className="dispute-success">
                    <span>
                      <Icon name="check" size={18} />
                    </span>
                    <div>
                      <strong>Aviso enviado para revisión</strong>
                      <p>
                        Un administrador comparará tu aviso con las valoraciones recientes antes de
                        modificar la información.
                      </p>
                    </div>
                    <button onClick={() => setReportOpen(false)} aria-label="Cerrar aviso">
                      <Icon name="close" size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="dispute-heading">
                      <span>
                        <Icon name="alert" size={18} />
                      </span>
                      <div>
                        <strong>¿Qué información no coincide?</strong>
                        <p>Tu aviso quedará pendiente de verificación por un administrador.</p>
                      </div>
                    </div>
                    <div className="dispute-options">
                      {["Ruido", "Iluminación", "Aglomeración", "Horarios"].map((reason) => (
                        <button
                          className={reportReason === reason ? "active" : ""}
                          onClick={() => setReportReason(reason)}
                          key={reason}
                        >
                          {reason}
                        </button>
                      ))}
                    </div>
                    <label>
                      Cuéntanos qué has observado <span>Opcional</span>
                      <textarea placeholder="Ej.: a esta hora había más ruido del indicado..." />
                    </label>
                    <div className="dispute-actions">
                      <button onClick={() => setReportOpen(false)}>Cancelar</button>
                      <button onClick={() => setReportSent(true)}>
                        Enviar aviso para verificar
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </section>
          <aside className="schedule-card">
            <div className="section-head">
              <div>
                <h3>Mejores horas para ir</h3>
                <p>Hoy, martes 24 de noviembre</p>
              </div>
              <Icon name="clock" />
            </div>
            <div className="best-time">
              <span>
                <Icon name="check" />
              </span>
              <div>
                <small>HORARIO RECOMENDADO</small>
                <strong>16:00 — 18:00</strong>
                <p>Suele haber poco ruido y baja afluencia.</p>
              </div>
            </div>
            <div className="time-chart">
              {[
                ["09", 45, "medium"],
                ["10", 64, "medium"],
                ["11", 80, "busy"],
                ["12", 68, "busy"],
                ["13", 52, "medium"],
                ["14", 38, "calm"],
                ["15", 30, "calm"],
                ["16", 18, "calm"],
                ["17", 20, "calm"],
                ["18", 32, "calm"],
                ["19", 55, "medium"],
                ["20", 70, "busy"],
              ].map(([hour, height, tone]) => (
                <div key={hour as string}>
                  <span className={`bar ${tone}`} style={{ height: `${height}%` }} />
                  <small>{hour}</small>
                </div>
              ))}
            </div>
            <div className="chart-key">
              <span>
                <i className="calm" /> Tranquilo
              </span>
              <span>
                <i className="medium" /> Moderado
              </span>
              <span>
                <i className="busy" /> Intenso
              </span>
            </div>
            <hr />
            <div className="opening">
              <Icon name="clock" />
              <span>
                <small>Horario de hoy</small>
                <strong>08:00 — 21:30</strong>
              </span>
              <span className="open">Abierto</span>
            </div>
            <button className="primary-button" onClick={() => setView("review")}>
              <Icon name="plus" size={18} /> Añadir una valoración
            </button>
            <p className="help-text">Tu experiencia ayuda a otras personas a decidir.</p>
          </aside>
        </div>
      </main>
    </div>
  );
}

function RatingScale({
  label,
  icon,
  value,
  setValue,
  labels,
}: {
  label: string;
  icon: IconName;
  value: number;
  setValue: (value: number) => void;
  labels: [string, string];
}) {
  return (
    <div className="rating-block">
      <div className="rating-title">
        <span>
          <Icon name={icon} />
        </span>
        <strong>{label}</strong>
        <em>{value <= 2 ? "Bajo" : value === 3 ? "Moderado" : "Alto"}</em>
      </div>
      <div className="rating-scale">
        {[1, 2, 3, 4, 5].map((item) => (
          <button
            aria-label={`${label}: nivel ${item}`}
            className={item <= value ? "filled" : ""}
            onClick={() => setValue(item)}
            key={item}
          >
            <span />
          </button>
        ))}
      </div>
      <div className="scale-labels">
        <small>{labels[0]}</small>
        <small>{labels[1]}</small>
      </div>
    </div>
  );
}

function ReviewView({ setView }: { setView: (view: View) => void }) {
  const [values, setValues] = useState({ noise: 2, light: 2, crowd: 1 });
  const [sent, setSent] = useState(false);
  const [locationKind, setLocationKind] = useState<"local" | "zone">("local");
  const [selectedArea, setSelectedArea] = useState<{ x: number; y: number } | null>(null);
  const [areaSize, setAreaSize] = useState(92);
  const [timeStart, setTimeStart] = useState("16:30");
  const [timeEnd, setTimeEnd] = useState("17:30");

  const selectArea = (event: ReactMouseEvent<HTMLButtonElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    setSelectedArea({
      x: ((event.clientX - bounds.left) / bounds.width) * 100,
      y: ((event.clientY - bounds.top) / bounds.height) * 100,
    });
  };

  if (sent)
    return (
      <div className="view-shell">
        <Header title="Nueva valoración" />
        <main className="success-wrap">
          <div className="success-card">
            <span className="success-check">
              <Icon name="check" size={34} />
            </span>
            <span className="eyebrow">VALORACIÓN ENVIADA</span>
            <h2>Gracias por compartir</h2>
            <p>
              Tu experiencia ayudará a otras personas a encontrar espacios que se adapten mejor a
              sus necesidades.
            </p>
            <button className="primary-button" onClick={() => setView("detail")}>
              Volver al mapa
            </button>
          </div>
        </main>
      </div>
    );

  return (
    <div className="view-shell review-view">
      <Header title="Nueva valoración" subtitle="Cuéntanos cómo se siente este lugar ahora." />
      <main className="review-content">
        <button className="back-link" onClick={() => setView("detail")}>
          <Icon name="arrow" size={18} /> Cancelar y volver
        </button>
        <div className="review-grid">
          <section className="review-form">
            <div className="location-kind">
              <span>¿Qué quieres señalar?</span>
              <div>
                <button
                  className={locationKind === "local" ? "active" : ""}
                  onClick={() => setLocationKind("local")}
                >
                  <Icon name="home" size={17} /> Un local
                </button>
                <button
                  className={locationKind === "zone" ? "active" : ""}
                  onClick={() => setLocationKind("zone")}
                >
                  <Icon name="map" size={17} /> Una zona abierta
                </button>
              </div>
            </div>
            <div className="form-progress">
              <span className="active">1</span>
              <i />
              <span>2</span>
              <i />
              <span>3</span>
              <small>Ambiente</small>
              <small>Detalles</small>
              <small>Confirmar</small>
            </div>
            <div className="form-heading">
              <span className="eyebrow">PASO 1 DE 3</span>
              <h2>¿Cómo está el ambiente?</h2>
              <p>Selecciona el nivel que percibes en este momento.</p>
            </div>
            <div className="time-range-block">
              <div className="time-range-heading">
                <span>
                  <Icon name="clock" size={18} />
                </span>
                <div>
                  <strong>¿Durante qué intervalo ocurre?</strong>
                  <p>Así podremos mostrar que en otras horas el ambiente puede ser diferente.</p>
                </div>
              </div>
              <div className="time-presets">
                <button
                  className={timeStart === "16:30" && timeEnd === "17:30" ? "active" : ""}
                  onClick={() => {
                    setTimeStart("16:30");
                    setTimeEnd("17:30");
                  }}
                >
                  Ahora · 1 h
                </button>
                <button
                  className={timeStart === "16:30" && timeEnd === "18:30" ? "active" : ""}
                  onClick={() => {
                    setTimeStart("16:30");
                    setTimeEnd("18:30");
                  }}
                >
                  Durante 2 h
                </button>
                <button
                  className={timeStart === "08:00" && timeEnd === "21:30" ? "active" : ""}
                  onClick={() => {
                    setTimeStart("08:00");
                    setTimeEnd("21:30");
                  }}
                >
                  Todo el día
                </button>
              </div>
              <div className="time-inputs">
                <label>
                  Desde
                  <span>
                    <Icon name="clock" size={15} />
                    <input
                      type="time"
                      value={timeStart}
                      onChange={(event) => setTimeStart(event.target.value)}
                    />
                  </span>
                </label>
                <i />
                <label>
                  Hasta
                  <span>
                    <Icon name="clock" size={15} />
                    <input
                      type="time"
                      value={timeEnd}
                      onChange={(event) => setTimeEnd(event.target.value)}
                    />
                  </span>
                </label>
                <em>Hoy, 24 nov</em>
              </div>
            </div>
            {locationKind === "zone" ? (
              <div className="zone-picker-block">
                <div className="zone-picker-heading">
                  <div>
                    <strong>Selecciona la zona exacta</strong>
                    <p>Pulsa sobre el mapa donde percibes estos estímulos.</p>
                  </div>
                  {selectedArea && (
                    <span>
                      <Icon name="check" size={14} /> Zona seleccionada
                    </span>
                  )}
                </div>
                <button
                  className={`zone-picker-map ${selectedArea ? "has-selection" : ""}`}
                  onClick={selectArea}
                  aria-label="Seleccionar una zona exacta en el mapa"
                  type="button"
                >
                  <span className="picker-road road-one" />
                  <span className="picker-road road-two" />
                  <span className="picker-river" />
                  <span className="picker-park">
                    <Icon name="tree" size={17} />
                  </span>
                  <span className="picker-building building-one" />
                  <span className="picker-building building-two" />
                  <span className="picker-map-label label-plaza">PLAZA DEL OLIVO</span>
                  <span className="picker-map-label label-paseo">PASEO DEL OLMO</span>
                  {selectedArea ? (
                    <span
                      className="picked-area"
                      style={{
                        left: `${selectedArea.x}%`,
                        top: `${selectedArea.y}%`,
                        width: areaSize,
                        height: areaSize,
                      }}
                    >
                      <span>
                        <Icon name="location" size={17} />
                      </span>
                    </span>
                  ) : (
                    <span className="picker-instruction">
                      <Icon name="location" size={17} /> Pulsa para marcar
                    </span>
                  )}
                </button>
                <div className="area-size-controls">
                  <span>Tamaño del área</span>
                  <button
                    type="button"
                    onClick={() => setAreaSize(Math.max(58, areaSize - 17))}
                    aria-label="Reducir área"
                  >
                    <Icon name="minus" size={15} />
                  </button>
                  <small>{areaSize < 80 ? "Pequeña" : areaSize < 115 ? "Media" : "Amplia"}</small>
                  <button
                    type="button"
                    onClick={() => setAreaSize(Math.min(140, areaSize + 17))}
                    aria-label="Ampliar área"
                  >
                    <Icon name="plus" size={15} />
                  </button>
                  {selectedArea && (
                    <button
                      className="clear-area"
                      type="button"
                      onClick={() => setSelectedArea(null)}
                    >
                      Cambiar zona
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <label className="comment-label location-description">
                Describe el lugar <span>Opcional</span>
                <textarea
                  placeholder="Ej.: cafetería pequeña con terraza cubierta y acceso desde la plaza..."
                  maxLength={280}
                />
                <small>0 / 280</small>
              </label>
            )}
            <RatingScale
              label="Nivel de ruido"
              icon="noise"
              value={values.noise}
              setValue={(noise) => setValues({ ...values, noise })}
              labels={["Silencioso", "Muy ruidoso"]}
            />
            <RatingScale
              label="Intensidad de la luz"
              icon="light"
              value={values.light}
              setValue={(light) => setValues({ ...values, light })}
              labels={["Luz suave", "Muy intensa"]}
            />
            <RatingScale
              label="Cantidad de personas"
              icon="group"
              value={values.crowd}
              setValue={(crowd) => setValues({ ...values, crowd })}
              labels={["Casi vacío", "Muy lleno"]}
            />
            <label className="comment-label">
              ¿Quieres añadir algún detalle? <span>Opcional</span>
              <textarea
                placeholder="Por ejemplo: la música está más baja en la terraza..."
                maxLength={240}
              />
              <small>0 / 240</small>
            </label>
            <div className="form-actions">
              <button className="secondary-button" onClick={() => setView("detail")}>
                Cancelar
              </button>
              <button
                className="primary-button"
                onClick={() => setSent(true)}
                disabled={locationKind === "zone" && !selectedArea}
                title={
                  locationKind === "zone" && !selectedArea
                    ? "Selecciona una zona en el mapa antes de enviar"
                    : undefined
                }
              >
                Enviar valoración <Icon name="check" size={18} />
              </button>
            </div>
          </section>
          <aside className="review-aside">
            <div className="mini-place">
              <span className="mini-image">
                <span />
              </span>
              <div>
                <small>ESTÁS VALORANDO</small>
                <strong>{locationKind === "local" ? "Café Calma" : "Nueva zona abierta"}</strong>
                <p>
                  <Icon name="location" size={14} />{" "}
                  {locationKind === "local" ? "Calle de la Paz, 18" : "Seleccionada en el mapa"}
                </p>
              </div>
            </div>
            <div className="privacy-note">
              <span>
                <Icon name="check" size={18} />
              </span>
              <div>
                <strong>Tu valoración es anónima</strong>
                <p>Solo usaremos tus respuestas para actualizar el estado sensorial del lugar.</p>
              </div>
            </div>
            <div className="reliability-info">
              <h3>¿Cómo funciona la fiabilidad?</h3>
              <p>
                Comparamos valoraciones recientes de distintas personas. Cuantas más coincidan, más
                fiable será la información.
              </p>
              <a href="#reliability">
                Saber más <Icon name="chevron" size={15} />
              </a>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

function BottomNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <nav className="bottom-nav" aria-label="Navegación móvil">
      <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>
        <Icon name="map" />
        <span>Explorar</span>
      </button>
      <button className={view === "detail" ? "active" : ""} onClick={() => setView("detail")}>
        <Icon name="home" />
        <span>Lugares</span>
      </button>
      <button className="add-mobile" onClick={() => setView("review")}>
        <span>
          <Icon name="plus" />
        </span>
        <small>Valorar</small>
      </button>
      <button>
        <Icon name="bell" />
        <span>Avisos</span>
      </button>
      <button>
        <Icon name="user" />
        <span>Perfil</span>
      </button>
    </nav>
  );
}

export default function App() {
  const [view, setView] = useState<View>("map");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  return (
    <div className="app-shell" data-theme={theme}>
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        aria-label={theme === "light" ? "Activar modo oscuro" : "Activar modo claro"}
        title={theme === "light" ? "Modo oscuro" : "Modo claro"}
      >
        <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
      </button>
      <SideNav view={view} setView={setView} />
      {view === "map" && <MapView setView={setView} />}
      {view === "detail" && <DetailView setView={setView} />}
      {view === "review" && <ReviewView setView={setView} />}
      <BottomNav view={view} setView={setView} />
    </div>
  );
}
