import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo
} from "react";

import Globe from "react-globe.gl";
import * as THREE from "three";
import { request, gql } from 'graphql-request';



export default function App() {
  const globeEl = useRef();
  const [countries, setCountries] = useState({ features: [] });
  const [hover, setHover] = useState();
  const [rotation, setRotation] = useState(true);
  const [dimensions,setDimensions] = useState([]);

  useEffect(() => {
    async function dimensionsCall() {
      const {globes} = await request(
        'https://api-ap-south-1.graphcms.com/v2/cl00u4mgs9cg401za64yq2ksk/master',gql`
        {
          globes{
            lat
            lng
          }
        }`
      );
      setDimensions(globes);
    }
    dimensionsCall()
    fetch(
      "https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson"
    )
      .then((res) => res.json())
      .then((countries) => {
        setCountries(countries);
      });
  }, []);

  useEffect(() => {
    setTimeout(() => {
      const geometry = new THREE.SphereBufferGeometry(100, 75, 75);
      const material = new THREE.MeshPhongMaterial();
      const mesh = new THREE.Mesh(geometry, material);
      mesh.scale.set(1.015, 1.015, 1.015);
    });
  }, []);

  useEffect(() => {
    globeEl.current.controls().autoRotate = true;
    globeEl.current.controls().autoRotateSpeed = 2;
    globeEl.current.pointOfView({ altitude: 1 }, 5000);
  }, [rotation]);

  const onHoverHandler = useCallback((polygon) => {
    if (polygon !== null) {
      setHover(polygon.properties.ISO_A3);
      globeEl.current.controls().autoRotate = false;
    } else {
      setHover(null);
      globeEl.current.controls().autoRotate = true;
    }
  }, []);

  const N = 1;
  const gData = [...Array(N).keys()].map(() => ({
    lat: dimensions[0]?.lat,
    lng: dimensions[0]?.lng,
    size: Math.random() / 3,
    color: ['red', 'white', 'blue', 'green'][Math.round(Math.random() * 3)],
  }));

  return (
    <Globe
      ref={globeEl}
      pointsData={gData}
      pointAltitude="size"
      pointColor="color"
      globeImageUrl="/download.jpeg"
      polygonsData={countries.features.filter(
        (d) => d.properties.ISO_A2 !== "AQ"
      )}
      polygonAltitude={0.01}
      polygonCapColor={(d) =>
        d.properties.ISO_A3 === hover
          ? "rgba(255, 255,255, 0.3)"
          : "rgba(255, 255,255, 0)"
      }
      polygonLabel={({ properties: d }) => `
        <b>${d.ADMIN} (${d.ISO_A2}):</b> <br />
        GDP: <i>${d.GDP_MD_EST}</i> M$<br/>
        Population: <i>${d.POP_EST}</i>
      `}
      polygonSideColor={() => "rgba(255, 255, 255, 0)"}
      onPolygonHover={onHoverHandler}
    />
  );
}