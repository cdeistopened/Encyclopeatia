// Show attribution data with external links for proper credit

export interface Show {
  id: string;
  name: string;
  host: string;
  description: string;
  externalUrl: string;
  color: string;
  icon: string;
  yearsActive: string;
}

export const SHOWS: Record<string, Show> = {
  "ask-the-herb-doctor": {
    id: "ask-the-herb-doctor",
    name: "Ask Your Herb Doctor",
    host: "Andrew Murray & Sarah Johanneson Murray",
    description: "Monthly call-in show on KMUD Radio featuring Dr. Ray Peat discussing health topics with callers.",
    externalUrl: "https://www.kmud.org/",
    color: "#2a9d8f",
    icon: "radio",
    yearsActive: "2008-2022"
  },
  "politics-and-science": {
    id: "politics-and-science",
    name: "Politics and Science",
    host: "John Barkhausen",
    description: "Long-form discussions on KMUD Radio covering the intersection of politics, science, and health.",
    externalUrl: "https://www.kmud.org/",
    color: "#1d3557",
    icon: "public",
    yearsActive: "2000-2020"
  },
  "generative-energy": {
    id: "generative-energy",
    name: "Generative Energy",
    host: "Danny Roddy",
    description: "Deep-dive interviews exploring bioenergetic health, metabolism, and Ray Peat's research.",
    externalUrl: "https://www.generativeenergy.com/",
    color: "#e63946",
    icon: "bolt",
    yearsActive: "2012-2024"
  },
  "eastwest-healing": {
    id: "eastwest-healing",
    name: "EastWest Healing",
    host: "Josh & Jeanne Rubin",
    description: "Discussions on metabolism, nutrition, and functional health with holistic practitioners.",
    externalUrl: "https://eastwesthealing.com/",
    color: "#f4a261",
    icon: "spa",
    yearsActive: "2010-2013"
  },
  "one-radio-network": {
    id: "one-radio-network",
    name: "One Radio Network",
    host: "Patrick Timpone",
    description: "Health and wellness interviews covering alternative perspectives on nutrition and medicine.",
    externalUrl: "https://oneradionetwork.com/",
    color: "#9c89b8",
    icon: "podcasts",
    yearsActive: "2014-2020"
  },
  "jodellefit": {
    id: "jodellefit",
    name: "JodelleFit",
    host: "Jodelle Fitzwater",
    description: "Fitness and nutrition discussions with a focus on metabolic health and hormones.",
    externalUrl: "https://jodellefit.com/",
    color: "#f72585",
    icon: "fitness_center",
    yearsActive: "2019-2020"
  },
  "butter-living-podcast": {
    id: "butter-living-podcast",
    name: "Butter Living Podcast",
    host: "Butter Living",
    description: "Conversations about real food, traditional nutrition, and pro-metabolic living.",
    externalUrl: "https://www.butterliving.com/",
    color: "#ffd166",
    icon: "restaurant",
    yearsActive: "2019-2020"
  },
  "its-rainmaking-time": {
    id: "its-rainmaking-time",
    name: "It's Rainmaking Time",
    host: "Kim Greenhouse",
    description: "Interviews exploring health, consciousness, and transformative ideas.",
    externalUrl: "https://itsrainmakingtime.com/",
    color: "#06d6a0",
    icon: "water_drop",
    yearsActive: "2011-2014"
  },
  "eluv": {
    id: "eluv",
    name: "Eluv",
    host: "Eluv",
    description: "Health and wellness discussions with alternative health perspectives.",
    externalUrl: "#",
    color: "#7209b7",
    icon: "favorite",
    yearsActive: "2008-2014"
  },
  "David Gornoski - A Neighbor's Choice": {
    id: "David Gornoski - A Neighbor's Choice",
    name: "A Neighbor's Choice",
    host: "David Gornoski",
    description: "Discussions on health, politics, and society through a lens of non-violence and metabolic health.",
    externalUrl: "https://aneighborschoice.com/",
    color: "#3a86ff",
    icon: "people",
    yearsActive: "2020-2022"
  },
  "source-nutritional-show": {
    id: "source-nutritional-show",
    name: "Source Nutritional Show",
    host: "Source Nutritional",
    description: "Nutritional science discussions focusing on evidence-based metabolic health.",
    externalUrl: "#",
    color: "#8338ec",
    icon: "nutrition",
    yearsActive: "2012"
  },
  "voice-of-america": {
    id: "voice-of-america",
    name: "Voice of America",
    host: "VOA",
    description: "International broadcast featuring health and science discussions.",
    externalUrl: "https://www.voanews.com/",
    color: "#0077b6",
    icon: "language",
    yearsActive: "2013"
  },
  "world-puja": {
    id: "world-puja",
    name: "World Puja",
    host: "World Puja Network",
    description: "Spiritual and wellness programming with holistic health discussions.",
    externalUrl: "#",
    color: "#ff6b6b",
    icon: "self_improvement",
    yearsActive: "2012"
  },
  "other": {
    id: "other",
    name: "Other Sources",
    host: "Various",
    description: "Miscellaneous interviews and discussions.",
    externalUrl: "#",
    color: "#6c757d",
    icon: "more_horiz",
    yearsActive: "Various"
  }
};

export function getShow(showName: string): Show {
  // Normalize the show name to match our keys
  const normalizedId = showName
    .toLowerCase()
    .replace(/\s+/g, '-')      // spaces to dashes
    .replace(/_/g, '-')         // underscores to dashes
    .replace(/['']/g, '')       // remove apostrophes
    .replace(/[^a-z0-9-]/g, '') // remove other special chars
    .replace(/-+/g, '-');       // collapse multiple dashes

  // Try exact match first, then normalized, then fallback
  return SHOWS[showName] || SHOWS[normalizedId] || SHOWS["other"];
}

export function getAllShows(): Show[] {
  return Object.values(SHOWS).filter(s => s.id !== "other");
}
