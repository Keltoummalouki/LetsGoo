-- Casablanca activity preview, checked 2 November 2026.
-- Park information and linked photos: WeCasablanca. Mosque visit: Fondation de la Mosquée Hassan II.
-- Mosque mosaic photo: Sakina Ben, CC0, Wikimedia Commons.
BEGIN;
INSERT INTO public.neighborhoods(name) VALUES ('Hermitage'), ('Sidi Belyout') ON CONFLICT DO NOTHING;
INSERT INTO public.places (slug,name,category,neighborhood,description,price,image,address,hours,transport,parking,tips,activities,outdoor,kid_friendly,audience,website,verified_at,published)
VALUES
  ('anfa-park-jogging-loop', 'Run the loop at Anfa Park', 'Sports & activities', 'Anfa', 'Follow the 1.5 km jogging circuit around the old airport grounds. Switch to a walk along the canal or stop at the outdoor exercise stations.', 0,
   'https://wecasablanca.com/sites/default/files/2021-09/foret/3.png',
   'Bd Sidi Abderrahmane at Bd Sidi Abdellah Ben Cherif, Casa Anfa',
   'Daily, 06:00–20:00',
   'Use the entrance at the intersection of the two boulevards.',
   'Parking availability and fees are unconfirmed.',
   'Bring water for the circuit. The playgrounds make a good second stop with children.',
   'Jogging, walking, outdoor fitness, playgrounds',
   true, true, ARRAY['Solo','Couple','Friends','Family'], 'https://wecasablanca.com/parcs-et-jardins', '2026-11-02', true),
  ('parc-hermitage-garden-walk', 'Walk the gardens of Parc de l’Hermitage', 'Outdoors', 'Hermitage', 'Explore a former horticultural garden along shaded paths. The park covers 18 hectares, with space for a morning jog or a quiet walk among the flowering trees.', 0,
   'https://wecasablanca.com/sites/default/files/2021-07/Lot-3/Parchermitage1/1.jpg',
   'Between Bd Anoual and Bd Modibo Keita, Casablanca',
   'Daily. The city guide recommends visiting between 08:00 and 18:00.',
   'Approach from Boulevard Anoual or Boulevard Modibo Keita.',
   'Parking availability and fees are unconfirmed.',
   'Try an early walk for a quieter visit.',
   'Garden walk, jogging, nature photography',
   true, true, ARRAY['Solo','Couple','Friends','Family'], 'https://wecasablanca.com/parcs-et-jardins', '2026-11-02', true),
  ('isesco-park-palm-walk', 'Follow the palm avenue at ISESCO Park', 'Outdoors', 'Habous', 'Walk down the central palm avenue of the former Jardin Murdoch. This four-hectare garden is a short outing near Habous and Mers Sultan.', 0,
   'https://wecasablanca.com/sites/default/files/2021-07/Lot-3/IsescoPark/2.jpg',
   'Boulevard Victor Hugo at Rue Omar El Idrissi, Casablanca',
   'Daily, 08:00–18:00',
   'Use the Victor Hugo and Omar El Idrissi intersection as your destination.',
   'Parking availability and fees are unconfirmed.',
   'Pair the walk with a visit to the neighboring Habous district.',
   'Palm-lined walk, garden photography',
   true, true, ARRAY['Solo','Couple','Friends','Family'], 'https://wecasablanca.com/parcs-et-jardins', '2026-11-02', true),
  ('hassan-ii-mosque-guided-tour', 'Tour the Hassan II Mosque', 'Culture', 'Sidi Belyout', 'See carved plaster, zellige and marble on a guided visit through the prayer hall, minaret hall and ablution hall. The displayed price is the Moroccan adult and resident rate.', 70,
   'https://upload.wikimedia.org/wikipedia/commons/3/37/%D9%81%D8%B3%D9%8A%D9%81%D8%B3%D8%A7%D8%A1_%D9%85%D8%B3%D8%AC%D8%AF_%D8%A7%D9%84%D8%AD%D8%B3%D9%86_%D8%A7%D9%84%D8%AB%D8%A7%D9%86%D9%8A.jpg',
   'Hassan II Mosque, Boulevard Moulay Youssef, Casablanca',
   'Guided departures only. The foundation publishes seasonal, Friday and Ramadan schedules. Confirm your departure on its website.',
   'Use Hassan II Mosque on Boulevard Moulay Youssef as your destination.',
   'Parking availability and fees are unconfirmed.',
   'Foreign adults pay 140 MAD. Moroccan adults, residents and foreign students pay 70 MAD. Children under six enter free. Cover shoulders and knees and remove shoes in the prayer hall.',
   'Guided architecture tour, Moroccan craftsmanship',
   false, true, ARRAY['Solo','Couple','Friends','Family'], 'https://fmh2.ma/en/mosque/visits/paid-guided-tour', '2026-11-02', true)
ON CONFLICT (slug) DO NOTHING;
COMMIT;
