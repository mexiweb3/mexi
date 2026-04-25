-- Pianitos · catálogo estático (lecciones + medallas iniciales).
-- Ejecutar después de 0001_init.sql.

insert into public.lessons (id, module, order_in_module, title, is_premium, duration_min) values
  ('m1l1', 1, 1, 'Hola, teclado',                false, 5),
  ('m1l2', 1, 2, 'Mis amigas las teclas blancas', false, 6),
  ('m1l3', 1, 3, 'Toda la familia Do-Si',        false, 6),
  ('m1l4', 1, 4, 'Mis cinco dedos pianistas',    false, 7),
  ('m1l5', 1, 5, 'Mi primera melodia',           false, 7),
  ('m2l1', 2, 1, 'El pulso del corazon',         true,  6),
  ('m2l2', 2, 2, 'Notas largas, notas cortas',   true,  6),
  ('m2l3', 2, 3, 'Manos al teclado',             true,  7),
  ('m2l4', 2, 4, 'Mi segunda cancion',           true,  7),
  ('m2l5', 2, 5, 'Mi primer concierto',          true,  8)
on conflict (id) do update set
  module = excluded.module,
  order_in_module = excluded.order_in_module,
  title = excluded.title,
  is_premium = excluded.is_premium,
  duration_min = excluded.duration_min;

insert into public.badges (id, name, description, icon) values
  ('first_do',     'Primer Do',         'Tocaste tu primer Do en el teclado.',         'star'),
  ('five_in_a_row','Cinco dias seguidos','Practicaste cinco dias seguidos.',           'flame'),
  ('steady_hand', 'Mano firme',         'Mantuviste el pulso en una cancion completa.','hand'),
  ('sharp_ear',   'Oido fino',          'Reconociste cinco notas seguidas de oido.',   'ear'),
  ('perfect_beat','Ritmo perfecto',     'Pasaste un ejercicio de ritmo sin errores.',  'metronome')
on conflict (id) do update set
  name = excluded.name,
  description = excluded.description,
  icon = excluded.icon;
