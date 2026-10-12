// The GridFlow team. `leader: true` also shows the person on the homepage.
// Photos live in public/team/. Leave `photo` empty to show initials instead.
export type Person = {
  name: string;
  role: string;
  photo: string;
  linkedin: string;
  bio: string;
  leader?: boolean;
};

export const team: Person[] = [
  {
    name: "Fred Siegele",
    role: "CEO",
    photo: "team/fred-siegele.webp",
    linkedin: "https://www.linkedin.com/in/fred-siegele-4919a44/",
    bio: "Three decades in specialty chemicals and equipment. Took Advanced Delivery & Chemical Systems from $80K in funding to a $230M exit.",
    leader: true,
  },
  {
    name: "Dr. Charles Call",
    role: "Founder & CTO",
    photo: "team/charles-call.webp",
    linkedin: "https://www.linkedin.com/in/charles-call-76933/",
    bio: "Energy systems engineer with 25 years leading deep-tech startups, three exits and more than 40 U.S. patents. PhD, UC Davis.",
    leader: true,
  },
  {
    name: "Dr. Sean Byrne",
    role: "Chief Scientist",
    photo: "team/sean-byrne.webp",
    linkedin: "https://www.linkedin.com/in/sean-byrne-515008251/",
    bio: "Electrochemist with ten years of research in batteries, electrodeposition and electrocatalysis. PhD, Caltech.",
    leader: true,
  },
  {
    name: "Blake Ridgeway",
    role: "Board Member",
    photo: "team/blake-ridgeway.webp",
    linkedin: "https://www.linkedin.com/in/blake-ridgeway-994a279/",
    bio: "Former senior vice president at Public Service Company of New Mexico, with deep utility-sector relationships.",
    leader: true,
  },
  {
    name: "Rudy Parra",
    role: "Lab Technician",
    photo: "team/rudy-parra.webp",
    linkedin: "https://www.linkedin.com/in/rudy-parra-329a2318a/",
    bio: "Keeps GridFlow's Albuquerque lab running and leads software development for Pii Energy, GridFlow's plug-in solar and battery line. Spectroscopy research background from the National Solar Observatory, and a board member of NM Tech Talks.",
  },
  {
    name: "Matthew Call",
    role: "Prototyping Engineer",
    photo: "team/matthew-call.webp",
    linkedin: "https://www.linkedin.com/in/matthew-call42/",
    bio: "Builds and tests prototype hardware in the lab, working across IoT sensors, microcontrollers, C++ and SOLIDWORKS. Joined in 2024 after six years in production manufacturing.",
  },
  {
    name: "Julian Mathias",
    role: "Data Scientist",
    photo: "team/julian-mathias.webp",
    linkedin: "https://www.linkedin.com/in/julianmathias/",
    bio: "Turns GridFlow's research and test data into answers. Holds a dual-concentration MBA, is a published co-author in business ethics, and has a background in medical and materials science research.",
  },
];
