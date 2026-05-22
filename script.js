const electorateMps = {
  "Auckland Central": {
    name: "Chloe Swarbrick",
    party: "Green",
    email: "Chloe.Swarbrick@parliament.govt.nz",
  },
  "Banks Peninsula": {
    name: "Vanessa Weenink",
    party: "National",
    email: "Vanessa.Weenink@parliament.govt.nz",
  },
  "Christchurch Central": {
    name: "Duncan Webb",
    party: "Labour",
    email: "Duncan.Webb@parliament.govt.nz",
  },
  "Christchurch East": {
    name: "Reuben Davidson",
    party: "Labour",
    email: "Reuben.Davidson@parliament.govt.nz",
  },
  Ilam: {
    name: "Hamish Campbell",
    party: "National",
    email: "Hamish.Campbell@parliament.govt.nz",
  },
  Maungakiekie: {
    name: "Greg Fleming",
    party: "National",
    email: "Greg.Fleming@parliament.govt.nz",
  },
  Rangitata: {
    name: "James Meager",
    party: "National",
    email: "James.Meager@parliament.govt.nz",
  },
  Rongotai: {
    name: "Julie Anne Genter",
    party: "Green",
    email: "JulieAnne.Genter@parliament.govt.nz",
  },
  Selwyn: {
    name: "Nicola Grigg",
    party: "National",
    email: "Nicola.Grigg@parliament.govt.nz",
  },
  Waimakariri: {
    name: "Matt Doocey",
    party: "National",
    email: "Matt.Doocey@parliament.govt.nz",
  },
  "Wellington Central": {
    name: "Tamatha Paul",
    party: "Green",
    email: "Tamatha.Paul@parliament.govt.nz",
  },
  Wigram: {
    name: "Megan Woods",
    party: "Labour",
    email: "Megan.Woods@parliament.govt.nz",
  },
};

const geocodeAddress = async (address) => {
  const params = new URLSearchParams({
    limit: "1",
    lang: "en",
    q: `${address}, New Zealand`,
  });
  const response = await fetch(`https://photon.komoot.io/api/?${params.toString()}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error("Address lookup failed.");
  const data = await response.json();
  const feature = data.features?.find((item) => item.properties?.countrycode === "NZ") || data.features?.[0];
  if (!feature) return null;
  const [lon, lat] = feature.geometry.coordinates;
  const props = feature.properties || {};
  const parts = [
    [props.housenumber, props.street].filter(Boolean).join(" "),
    props.name,
    props.district,
    props.city,
    props.state,
    props.postcode,
  ].filter(Boolean);
  return {
    lon,
    lat,
    display_name: [...new Set(parts)].join(", "),
  };
};

const resolveElectorate = async ({ lon, lat }) => {
  const params = new URLSearchParams({
    f: "json",
    geometry: `${lon},${lat}`,
    geometryType: "esriGeometryPoint",
    inSR: "4326",
    spatialRel: "esriSpatialRelIntersects",
    outFields: "GED_name,GED_name_ascii",
    returnGeometry: "false",
  });
  const url = `https://services.arcgis.com/XTtANUDT8Va4DLwI/arcgis/rest/services/General_Electorates_2020/FeatureServer/0/query?${params.toString()}`;
  const response = await fetch(url, { headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error("Electorate boundary lookup failed.");
  const data = await response.json();
  const feature = data.features?.[0];
  return feature?.attributes?.GED_name_ascii || feature?.attributes?.GED_name || null;
};

const buildEmail = ({ mp, electorate, address }) => {
  const subject = `Please publish a healthcare recovery plan for ${electorate}`;
  const body = `Kia ora ${mp.name},

I live at or near ${address}, which this campaign's address lookup resolved to the ${electorate} electorate.

I am asking you to publicly support a measurable healthcare recovery plan for ${electorate} and for New Zealand. The failure pattern is clear: distress is rising, access is narrowing, public-hospital nursing shifts are below target, mental-health and aged-care pressure is worsening, and private contracting is expanding without enough public transparency.

Please reply with your position on:

1. Public safe-staffing reporting by ward and shift.
2. Faster access to mental health and addiction support, including early psychosis and youth services.
3. Retention funding for nurses, doctors, psychiatrists, psychologists, and allied health staff.
4. Aged-care capacity, dementia care, and home support.
5. Full transparency for private healthcare contracts, including cost, outcomes, complications, workforce impact, and equity impact.

Nga mihi,`;

  return `mailto:${mp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const renderUnknownMp = ({ result, electorate, address, displayName }) => {
  const parliamentSearch = `https://www.parliament.nz/en/mps-and-electorates/members-of-parliament/?Search=${encodeURIComponent(electorate)}`;
  result.innerHTML = `
    <strong>${electorate}</strong>
    <p>Matched from: ${displayName || address}. We found the electorate, but this local static lookup does not yet have that MP's email seeded.</p>
    <a href="${parliamentSearch}" target="_blank" rel="noreferrer">Find MP on Parliament</a>
    <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify electorate</a>
  `;
};

const wireMpFinder = () => {
  const form = document.querySelector(".action-card");
  const input = document.querySelector("#address-input");
  const result = document.querySelector("#mp-result");
  const button = form?.querySelector("button");
  if (!form || !input || !result || !button) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const address = input.value.trim();
    if (address.length < 6) {
      result.innerHTML = `
        <strong>Enter a fuller street address.</strong>
        <p>Use a street number, street name, town or city, for example: 300 Burwood Road, Christchurch.</p>
      `;
      return;
    }

    button.disabled = true;
    button.textContent = "Finding electorate...";
    result.innerHTML = "<p>Checking the address against electorate boundaries...</p>";

    try {
      const geocode = await geocodeAddress(address);
      if (!geocode) {
        result.innerHTML = `
          <strong>Address not found.</strong>
          <p>Try adding the suburb or city, or verify directly with Vote NZ.</p>
          <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify on Vote NZ</a>
        `;
        return;
      }

      const electorate = await resolveElectorate({ lon: geocode.lon, lat: geocode.lat });
      if (!electorate) {
        result.innerHTML = `
          <strong>No electorate boundary match.</strong>
          <p>We found the address as ${geocode.display_name}, but could not resolve the electorate. Verify it with Vote NZ.</p>
          <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify on Vote NZ</a>
        `;
        return;
      }

      const mp = electorateMps[electorate];
      if (!mp) {
        renderUnknownMp({ result, electorate, address, displayName: geocode.display_name });
        return;
      }

      result.innerHTML = `
        <strong>${mp.name}</strong>
        <p>${electorate} electorate MP, ${mp.party}. Matched from: ${geocode.display_name}.</p>
        <a href="${buildEmail({ mp, electorate, address })}">Email ${mp.name}</a>
        <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify electorate</a>
      `;
    } catch (error) {
      result.innerHTML = `
        <strong>Lookup unavailable.</strong>
        <p>The address lookup service did not respond. Verify with Vote NZ, then use the MP email template.</p>
        <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify on Vote NZ</a>
      `;
    } finally {
      button.disabled = false;
      button.textContent = "Find my MP";
    }
  });
};

const wireTopicSwitcher = () => {
  const buttons = [...document.querySelectorAll("[data-view]")];
  const panels = [...document.querySelectorAll("[data-panel]")];
  const navLinks = [...document.querySelectorAll("[data-view-link]")];
  if (!buttons.length || !panels.length) return;
  const hashViews = {
    "#frontline": "workers",
    "#evidence": "mental",
    "#courts": "mental",
    "#elder-care": "elder",
    "#funding": "budget",
    "#privatisation": "privatisation",
  };

  const setView = (view, shouldScroll = true) => {
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.panel !== view;
    });

    buttons.forEach((button) => {
      button.setAttribute("aria-selected", String(button.dataset.view === view));
    });

    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.dataset.viewLink === view);
    });

    if (shouldScroll) {
      document.querySelector("#topics")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setView(button.dataset.view));
  });

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      setView(link.dataset.viewLink);
    });
  });

  setView(hashViews[window.location.hash] || "workers", false);
};

wireTopicSwitcher();
wireMpFinder();
