const mpLookup = [
  {
    name: "Reuben Davidson",
    electorate: "Christchurch East",
    party: "Labour",
    email: "Reuben.Davidson@parliament.govt.nz",
    postcodes: ["8061", "8062", "8083"],
    note: "Covers much of eastern Christchurch, including Burwood-area postcodes.",
  },
  {
    name: "Duncan Webb",
    electorate: "Christchurch Central",
    party: "Labour",
    email: "Duncan.Webb@parliament.govt.nz",
    postcodes: ["8011", "8013", "8014"],
  },
  {
    name: "Hamish Campbell",
    electorate: "Ilam",
    party: "National",
    email: "Hamish.Campbell@parliament.govt.nz",
    postcodes: ["8041", "8043", "8051", "8052", "8053"],
  },
  {
    name: "Megan Woods",
    electorate: "Wigram",
    party: "Labour",
    email: "Megan.Woods@parliament.govt.nz",
    postcodes: ["8024", "8042", "8045"],
  },
  {
    name: "Vanessa Weenink",
    electorate: "Banks Peninsula",
    party: "National",
    email: "Vanessa.Weenink@parliament.govt.nz",
    postcodes: ["8022", "8023", "8025", "8971"],
    note: "Some southern Christchurch postcodes can sit near electorate boundaries.",
  },
  {
    name: "Matt Doocey",
    electorate: "Waimakariri",
    party: "National",
    email: "Matt.Doocey@parliament.govt.nz",
    postcodes: ["7400", "7402", "7610", "7614", "7630", "7471"],
  },
  {
    name: "Nicola Grigg",
    electorate: "Selwyn",
    party: "National",
    email: "Nicola.Grigg@parliament.govt.nz",
    postcodes: ["7602", "7604", "7612", "7632", "7671"],
  },
  {
    name: "James Meager",
    electorate: "Rangitata",
    party: "National",
    email: "James.Meager@parliament.govt.nz",
    postcodes: ["7700", "7702", "7901", "7910", "7920", "7930", "7940"],
  },
  {
    name: "Greg Fleming",
    electorate: "Maungakiekie",
    party: "National",
    email: "Greg.Fleming@parliament.govt.nz",
    postcodes: ["1061", "1062", "1064"],
  },
  {
    name: "Chloe Swarbrick",
    electorate: "Auckland Central",
    party: "Green",
    email: "Chloe.Swarbrick@parliament.govt.nz",
    postcodes: ["1010", "1011"],
  },
  {
    name: "Julie Anne Genter",
    electorate: "Rongotai",
    party: "Green",
    email: "JulieAnne.Genter@parliament.govt.nz",
    postcodes: ["6021", "6022", "6023"],
  },
  {
    name: "Tamatha Paul",
    electorate: "Wellington Central",
    party: "Green",
    email: "Tamatha.Paul@parliament.govt.nz",
    postcodes: ["6011", "6012"],
  },
];

const findMp = (postcode) => {
  const cleaned = postcode.replace(/\D/g, "").slice(0, 4);
  if (cleaned.length !== 4) return null;
  return mpLookup.find((mp) => mp.postcodes.includes(cleaned)) || null;
};

const buildEmail = (mp, postcode) => {
  const subject = `Please publish a healthcare recovery plan for ${mp.electorate}`;
  const body = `Kia ora ${mp.name},

I live in postcode ${postcode}, and your electorate is the local match returned by this campaign's postcode lookup.

I am asking you to publicly support a measurable healthcare recovery plan for ${mp.electorate} and for New Zealand. The failure pattern is clear: distress is rising, access is narrowing, public-hospital nursing shifts are below target, mental-health and aged-care pressure is worsening, and private contracting is expanding without enough public transparency.

Please reply with your position on:

1. Public safe-staffing reporting by ward and shift.
2. Faster access to mental health and addiction support, including early psychosis and youth services.
3. Retention funding for nurses, doctors, psychiatrists, psychologists, and allied health staff.
4. Aged-care capacity, dementia care, and home support.
5. Full transparency for private healthcare contracts, including cost, outcomes, complications, workforce impact, and equity impact.

Nga mihi,`;

  return `mailto:${mp.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

const wireMpFinder = () => {
  const form = document.querySelector(".action-card");
  const input = document.querySelector("#postcode-input");
  const result = document.querySelector("#mp-result");
  if (!form || !input || !result) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const postcode = input.value.replace(/\D/g, "").slice(0, 4);
    const mp = findMp(postcode);

    if (!mp) {
      result.innerHTML = `
        <strong>No confident postcode match yet.</strong>
        <p>NZ postcodes do not map cleanly to electorates. Verify your electorate with Vote NZ, then use the MP email template.</p>
        <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify on Vote NZ</a>
      `;
      return;
    }

    const note = mp.note ? `<p>${mp.note}</p>` : "";
    result.innerHTML = `
      <strong>${mp.name}</strong>
      <p>${mp.electorate} electorate MP, ${mp.party}. ${note}</p>
      <a href="${buildEmail(mp, postcode)}">Email ${mp.name}</a>
      <a href="https://vote.nz/maps/find-your-electorate" target="_blank" rel="noreferrer">Verify electorate</a>
    `;
  });
};

wireMpFinder();
