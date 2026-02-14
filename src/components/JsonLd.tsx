/**
 * JSON-LD 구조화 데이터 컴포넌트
 * 기차 시간표 사이트 전용
 */

interface TrainStationSchemaProps {
  name: string;
  address?: string;
  telephone?: string;
  url: string;
}

interface TrainTripSchemaProps {
  departureStation: string;
  arrivalStation: string;
  departureTime?: string;
  arrivalTime?: string;
  price?: number;
  trainType?: string;
  url: string;
  dateModified?: string;
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface TableSchemaProps {
  name: string;
  description: string;
  columns: string[];
  rows: string[][];
}

export function TrainStationJsonLd({ name, address, telephone, url }: TrainStationSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TrainStation',
    name,
    url,
  };
  if (address) {
    schema.address = { '@type': 'PostalAddress', streetAddress: address, addressCountry: 'KR' };
  }
  if (telephone) {
    schema.telephone = telephone;
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function TrainTripJsonLd({ departureStation, arrivalStation, departureTime, price, trainType, url, dateModified }: TrainTripSchemaProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'TrainTrip',
    name: `${departureStation} → ${arrivalStation} ${trainType || '열차'}`,
    departureStation: { '@type': 'TrainStation', name: departureStation },
    arrivalStation: { '@type': 'TrainStation', name: arrivalStation },
    url,
  };
  if (departureTime) schema.departureTime = departureTime;
  if (price && price > 0) {
    schema.offers = { '@type': 'Offer', price, priceCurrency: 'KRW', availability: 'https://schema.org/InStock' };
  }
  if (dateModified) schema.dateModified = dateModified;
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem', position: index + 1, name: item.name, item: item.url,
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function FAQJsonLd({ items }: { items: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question', name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

export function TableJsonLd({ name, description }: TableSchemaProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Table',
    name,
    description,
    about: { '@type': 'Thing', name: '열차 시간표' },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// WebSite 스키마 (메인 페이지용)
export function WebSiteJsonLd({ name, url, description }: { name: string; url: string; description: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name,
    url,
    description,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}/stations/?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// Organization 스키마
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: '기차 시간표 - mustarddata',
    url: 'https://train.mustarddata.com',
    logo: 'https://train.mustarddata.com/icon.png',
    sameAs: ['https://mustarddata.com', 'https://bus.mustarddata.com', 'https://calc.mustarddata.com', 'https://apt.mustarddata.com'],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: 'Korean',
    },
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

interface ItemListItem {
  name: string;
  url: string;
  description?: string;
  position?: number;
}

// ItemList 스키마
export function ItemListJsonLd({ items, name }: { items: ItemListItem[]; name: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: item.position || index + 1,
      name: item.name,
      url: item.url,
      ...(item.description && { description: item.description }),
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

interface HowToStep {
  name: string;
  text: string;
  url?: string;
}

// HowTo 스키마
export function HowToJsonLd({ name, description, steps, totalTime }: { name: string; description: string; steps: HowToStep[]; totalTime?: string }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    ...(totalTime && { totalTime }),
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text,
      ...(step.url && { url: step.url }),
    })),
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// Service 스키마
export function ServiceJsonLd({ name, description, provider, areaServed }: { name: string; description: string; provider: string; areaServed: string[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    provider: { '@type': 'Organization', name: provider },
    areaServed: areaServed.map(area => ({ '@type': 'Place', name: area })),
    serviceType: '대중교통 정보 서비스',
  };
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}

// LocalBusiness 스키마 (기차역 상세 페이지용)
interface LocalBusinessJsonLdProps {
  name: string;
  address: string;
  telephone?: string;
  url: string;
  openingHours?: string[];
  geo?: {
    latitude: number;
    longitude: number;
  };
}

export function LocalBusinessJsonLd({ name, address, telephone, url, openingHours, geo }: LocalBusinessJsonLdProps) {
  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name,
    url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: address,
      addressCountry: 'KR',
    },
  };
  if (telephone) {
    schema.telephone = telephone;
  }
  if (openingHours && openingHours.length > 0) {
    schema.openingHours = openingHours;
  }
  if (geo) {
    schema.geo = {
      '@type': 'GeoCoordinates',
      latitude: geo.latitude,
      longitude: geo.longitude,
    };
  }
  return (
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
  );
}
