insert into public.categories(name) values ('Outdoors'),('Culture'),('Entertainment'),('Sports & activities'),('Shopping & leisure'),('Hidden gems') on conflict do nothing;
insert into public.neighborhoods(name) values ('Aïn Diab'),('Anfa'),('City center'),('Habous'),('Bouskoura') on conflict do nothing;
-- No unverified venue facts are inserted into the production catalog.
