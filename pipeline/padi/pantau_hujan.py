"""Pemantauan hujan bulanan per kabupaten/kota di Jawa untuk musim tanam padi.

Dijalankan otomatis tiap bulan oleh GitHub Actions (.github/workflows/pantau-padi.yml):
1. unduh CHIRPS bulanan terbaru untuk Jawa dari IRI Data Library (tanpa akun);
2. hitung rata-rata hujan per kabupaten dan bandingkan dengan normal 1991-2020;
3. simpan hasilnya ke assets/data/padi-pantau.json, yang dibaca peta di project-padi.html.
"""
import io, json, os, time
from datetime import date, datetime, timezone
import numpy as np
import pandas as pd
import geopandas as gpd
import requests
import xarray as xr
from rasterio import features
from rasterio.transform import from_origin

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(ROOT, "assets", "data", "padi-pantau.json")
IRI = ("https://iridl.ldeo.columbia.edu/SOURCES/.UCSB/.CHIRPS/.v2p0/.monthly/.global/.precipitation/"
       "X/105/115/RANGEEDGES/Y/-9/-5.5/RANGEEDGES/T/({a})/({b})/RANGEEDGES/data.nc")
BLN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

# Pantau 12 bulan terakhir agar musim hujan (Nov-Feb) dan kemarau sebelumnya selalu terlihat
today = date.today()
start = pd.Period(today, "M") - 12
end = pd.Period(today, "M")
url = IRI.format(a=f"{BLN[start.month - 1]} {start.year}", b=f"{BLN[end.month - 1]} {end.year}").replace(" ", "%20")
for attempt in range(5):
    try:
        r = requests.get(url, timeout=600); r.raise_for_status(); break
    except requests.RequestException as e:
        if attempt == 4:
            raise
        print("coba ulang:", e); time.sleep(30 * (attempt + 1))

ds = xr.open_dataset(io.BytesIO(r.content), decode_times=False)
pr = ds["precipitation"].sortby("Y", ascending=False)
mi = np.floor(pr["T"].values).astype(int)
bulan = [f"{1960 + m // 12}-{m % 12 + 1:02d}" for m in mi]
x, y = pr["X"].values, pr["Y"].values
res = float(x[1] - x[0])
transform = from_origin(x[0] - res / 2, y[0] + res / 2, res, res)
arr = pr.values

kab = gpd.read_file(os.path.join(ROOT, "assets", "data", "padi-kabupaten.geojson"))
normal = pd.read_csv(os.path.join(HERE, "normal_hujan_1991_2020.csv")).set_index(["kode", "bln"])

hasil, total_h, total_n = {}, np.zeros(len(bulan)), np.zeros(len(bulan))
for kode, geom in zip(kab["kode"], kab.geometry):
    m = features.rasterize([(geom, 1)], out_shape=arr.shape[1:], transform=transform).astype(bool)
    if m.sum() < 3:
        m = features.rasterize([(geom, 1)], out_shape=arr.shape[1:], transform=transform, all_touched=True).astype(bool)
    h = np.nanmean(arr[:, m], axis=1)
    n = np.array([normal.loc[(kode, int(b[5:])), "hujan_normal"] for b in bulan])
    total_h += h; total_n += n
    tiga = h[-3:].sum() / n[-3:].sum() * 100              # 3 bulan terakhir, lebih stabil daripada satu bulan
    hasil[str(kode)] = {"hujan": [round(float(v)) for v in h], "persen": [round(float(v / w * 100)) for v, w in zip(h, n)],
                        "persen_3bln": round(float(tiga))}

out = {"diperbarui": datetime.now(timezone.utc).strftime("%Y-%m-%d"), "sumber": "CHIRPS v2.0 (UCSB), melalui IRI Data Library",
       "bulan": bulan, "jawa": {"hujan": [round(float(v / len(kab))) for v in total_h], "normal": [round(float(v / len(kab))) for v in total_n]},
       "kabupaten": hasil}
json.dump(out, open(OUT, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("bulan terakhir:", bulan[-1], "| Jawa:", out["jawa"]["hujan"][-1], "mm, normal", out["jawa"]["normal"][-1], "mm")
