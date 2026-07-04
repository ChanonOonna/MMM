import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { DEFAULT_MAP_CENTER, type VenueCoords } from "../venueCoords";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="font-size:28px;line-height:1;transform:translate(-50%,-100%)">📍</div>`,
  iconSize: [0, 0],
});

type LayerId = "street" | "terrain" | "satellite";

const LAYERS: Record<LayerId, { label: string; url: string; attribution: string }> = {
  street: {
    label: "แผนที่",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  },
  terrain: {
    label: "ภูมิประเทศ",
    url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
    attribution: '&copy; OpenStreetMap contributors, SRTM | &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
  },
  satellite: {
    label: "ดาวเทียม",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics",
  },
};

function ClickToPin({ onPick }: { onPick: (coords: VenueCoords) => void }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
}

export function VenuePinPicker({
  initial,
  onChange,
}: {
  initial: VenueCoords | null;
  onChange: (coords: VenueCoords) => void;
}) {
  const [coords, setCoords] = useState<VenueCoords>(initial ?? DEFAULT_MAP_CENTER);
  const [layer, setLayer] = useState<LayerId>("street");

  const pick = (c: VenueCoords) => {
    setCoords(c);
    onChange(c);
  };

  return (
    <div>
      <div className="flex gap-1.5 mb-2">
        {(Object.keys(LAYERS) as LayerId[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => setLayer(id)}
            className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${layer === id ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
          >
            {LAYERS[id].label}
          </button>
        ))}
      </div>
      <div className="rounded-xl overflow-hidden border border-border" style={{ height: 280 }}>
        <MapContainer center={[coords.lat, coords.lng]} zoom={16} style={{ height: "100%", width: "100%" }}>
          <TileLayer key={layer} attribution={LAYERS[layer].attribution} url={LAYERS[layer].url} />
          <Marker position={[coords.lat, coords.lng]} icon={pinIcon} />
          <ClickToPin onPick={pick} />
        </MapContainer>
      </div>
    </div>
  );
}
