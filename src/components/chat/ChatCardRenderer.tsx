"use client";

import { ConversationCard } from "@/types/api";
import { CityCard } from "./CityCard";
import { ComparisonCard } from "./ComparisonCard";
import { HealthTipCard } from "./HealthTipCard";

interface ChatCardRendererProps {
  card: ConversationCard;
}

export function ChatCardRenderer({ card }: ChatCardRendererProps) {
  switch (card.type) {
    case "city_summary":
      return <CityCard data={card} />;
    case "comparison":
      return <ComparisonCard data={card} />;
    case "health_tip":
      return <HealthTipCard data={card} />;
    default:
      return null;
  }
}
