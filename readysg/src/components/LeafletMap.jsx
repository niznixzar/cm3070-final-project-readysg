// Leaflet map in a WebView, so it works in Expo Go without native map modules.
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import { useTheme } from 'react-native-paper';
import { T } from './ui';
import { space } from '../theme';
import { SG_CENTER } from '../lib/geo';

export const RESOURCE_TYPES = {
  aed: { label: 'AED', letter: 'A', color: '#A4161A' },
  shelter: { label: 'Civil defence shelter', letter: 'S', color: '#161616' },
  assembly: { label: 'Assembly area', letter: 'E', color: '#1747A6' },
  firstaid: { label: 'First aid station', letter: '+', color: '#1E6B3A' },
  lep: { label: 'Lifesavers\u2019 Emergency Point', letter: 'L', color: '#7A3E00' },
};

const html = `<!doctype html>
<html><head>
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5">
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css">
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<style>
  html, body, #map { height: 100%; margin: 0; }
  .pin { width: 36px; height: 36px; border-radius: 18px 18px 18px 4px; transform: rotate(-45deg);
         border: 2px solid #fff; box-shadow: 0 1px 3px rgba(0,0,0,.4); display: flex;
         align-items: center; justify-content: center; }
  .pin span { transform: rotate(45deg); color: #fff; font: 700 15px system-ui, sans-serif; }
  .pin.sel { outline: 3px solid #1747A6; outline-offset: 2px; }
  .me { width: 18px; height: 18px; border-radius: 9px; background: #1747A6; border: 3px solid #fff;
        box-shadow: 0 0 0 6px rgba(23,71,166,.25); }
  .adding { cursor: crosshair; }
</style>
</head><body><div id="map"></div>
<script>
  var send = function (m) { window.ReactNativeWebView.postMessage(JSON.stringify(m)); };
  var TYPES = ${JSON.stringify(RESOURCE_TYPES)};
  var map = L.map('map', { zoomControl: true }).setView([${SG_CENTER.lat}, ${SG_CENTER.lng}], 12);
  // OneMap (Singapore's official map), with OpenStreetMap as a fallback.
  var oneMap = L.tileLayer('https://www.onemap.gov.sg/maps/tiles/Default/{z}/{x}/{y}.png', {
    minZoom: 11, maxZoom: 19,
    attribution: '<a href="https://www.onemap.gov.sg/">OneMap</a> &copy; contributors | <a href="https://www.sla.gov.sg/">Singapore Land Authority</a>'
  }).addTo(map);
  var tileErrors = 0;
  oneMap.on('tileerror', function () {
    tileErrors++;
    if (tileErrors === 4) {
      map.removeLayer(oneMap);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);
    }
  });

  var layer = L.layerGroup().addTo(map);
  var meMarker = null, selected = null, adding = false, draft = null;

  function icon(type, isSel) {
    var t = TYPES[type] || TYPES.aed;
    return L.divIcon({ className: '', iconSize: [36, 36], iconAnchor: [4, 36],
      html: '<div class="pin' + (isSel ? ' sel' : '') + '" style="background:' + t.color + '"><span>' + t.letter + '</span></div>' });
  }

  window.readysg = {
    setResources: function (list, selId) {
      selected = selId; layer.clearLayers();
      list.forEach(function (r) {
        L.marker([r.lat, r.lng], { icon: icon(r.type, r.id === selId), title: r.name, alt: r.name })
          .on('click', function () { send({ type: 'select', id: r.id }); })
          .addTo(layer);
      });
    },
    setMe: function (lat, lng, pan) {
      if (!meMarker) meMarker = L.marker([lat, lng], { icon: L.divIcon({ className: '', html: '<div class="me"></div>', iconSize: [18, 18] }), interactive: false }).addTo(map);
      else meMarker.setLatLng([lat, lng]);
      if (pan) map.setView([lat, lng], 16);
    },
    panTo: function (lat, lng) { map.setView([lat, lng], Math.max(map.getZoom(), 16)); },
    setAdding: function (on) {
      adding = on; document.getElementById('map').classList.toggle('adding', on);
      if (!on && draft) { map.removeLayer(draft); draft = null; }
    }
  };

  map.on('click', function (e) {
    if (!adding) return;
    if (draft) map.removeLayer(draft);
    draft = L.circleMarker(e.latlng, { radius: 10, color: '#A4161A', weight: 3 }).addTo(map);
    send({ type: 'press', lat: e.latlng.lat, lng: e.latlng.lng });
  });
  send({ type: 'ready' });
</script></body></html>`;

const LeafletMap = forwardRef(function LeafletMap({ resources, selectedId, me, adding, onSelect, onPress }, ref) {
  const { colors } = useTheme();
  const web = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);

  const run = (js) => web.current?.injectJavaScript(`${js}; true;`);

  useImperativeHandle(ref, () => ({
    panTo: (lat, lng) => run(`window.readysg.panTo(${lat}, ${lng})`),
    centerOnMe: () => me && run(`window.readysg.setMe(${me.lat}, ${me.lng}, true)`),
  }));

  useEffect(() => {
    if (ready) run(`window.readysg.setResources(${JSON.stringify(resources)}, ${JSON.stringify(selectedId ?? null)})`);
  }, [ready, resources, selectedId]);

  useEffect(() => {
    if (ready && me) run(`window.readysg.setMe(${me.lat}, ${me.lng}, false)`);
  }, [ready, me]);

  useEffect(() => {
    if (ready) run(`window.readysg.setAdding(${adding ? 'true' : 'false'})`);
  }, [ready, adding]);

  const onMessage = (e) => {
    try {
      const msg = JSON.parse(e.nativeEvent.data);
      if (msg.type === 'ready') setReady(true);
      if (msg.type === 'select') onSelect?.(msg.id);
      if (msg.type === 'press') onPress?.({ lat: msg.lat, lng: msg.lng });
    } catch {}
  };

  if (failed) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl, backgroundColor: colors.surfaceVariant, borderRadius: 14 }}>
        <T variant="bodyBold" style={{ textAlign: 'center' }}>The map needs an internet connection.</T>
        <T style={{ textAlign: 'center', color: colors.onSurfaceVariant }}>Switch to List to see saved resources.</T>
      </View>
    );
  }

  return (
    <View
      style={{ flex: 1, borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: colors.outlineVariant }}
      accessible
      accessibilityLabel="Map of emergency resources. For a screen-reader friendly version, switch to List."
    >
      <WebView
        ref={web}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://readysg.local/' }}
        onMessage={onMessage}
        onError={() => setFailed(true)}
        javaScriptEnabled
        domStorageEnabled
        setSupportMultipleWindows={false}
        style={{ flex: 1 }}
      />
    </View>
  );
});

export default LeafletMap;
