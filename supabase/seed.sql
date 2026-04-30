-- LoL Counter App - Seed Data
-- Run AFTER schema.sql. Curated counters for ~40 popular champions across all roles.
-- Champion IDs match Riot Data Dragon (case-sensitive).
-- Item IDs are Data Dragon item numbers.

truncate table counters restart identity;
truncate table counter_items restart identity;

-- ============================================================
-- COUNTERS  (champion_id is the champ being countered)
-- ============================================================
insert into counters (champion_id, counter_id, counter_role, win_rate, tier, notes, patch) values
-- Yasuo
('Yasuo','Malzahar','MIDDLE',56.2,'S','Suppression umgeht Windwall',  '14.X'),
('Yasuo','Annie','MIDDLE',54.8,'A','Stun + Tibbers burst',             '14.X'),
('Yasuo','Pantheon','MIDDLE',54.1,'A','Frühe All-In Pressure',          '14.X'),
('Yasuo','Renekton','TOP',55.0,'A','Dominiert Lane früh',                '14.X'),
('Yasuo','Quinn','TOP',53.7,'B','Range counter im Top',                  '14.X'),

-- Yone
('Yone','Malzahar','MIDDLE',55.4,'S','Suppression + Burst',              '14.X'),
('Yone','Pantheon','MIDDLE',54.0,'A','Punkt-Stun + Damage',              '14.X'),
('Yone','Lissandra','MIDDLE',53.5,'A','Crowd Control + Mobility',        '14.X'),
('Yone','Renekton','TOP',54.6,'A','Brawl-Counter',                       '14.X'),

-- Zed
('Zed','Lissandra','MIDDLE',55.9,'S','Cleanse Ult bricht Combo',         '14.X'),
('Zed','Malzahar','MIDDLE',55.1,'A','Suppression + Sustain',             '14.X'),
('Zed','Pantheon','MIDDLE',53.4,'B','Frühpressure',                      '14.X'),
('Zed','Diana','MIDDLE',53.0,'B','All-In Counter',                       '14.X'),

-- Akali
('Akali','Pantheon','MIDDLE',55.3,'S','Stun in Shroud',                  '14.X'),
('Akali','Galio','MIDDLE',54.7,'A','Magic Dmg Counter',                  '14.X'),
('Akali','Kassadin','MIDDLE',53.8,'A','Skaliert besser',                 '14.X'),

-- Katarina
('Katarina','Malzahar','MIDDLE',56.0,'S','Suppression cancelt Ult',      '14.X'),
('Katarina','Diana','MIDDLE',54.2,'A','Burst-Counter',                   '14.X'),
('Katarina','Galio','MIDDLE',53.1,'B','Magic Shield',                    '14.X'),

-- Darius
('Darius','Quinn','TOP',55.6,'S','Kited ihn easy',                       '14.X'),
('Darius','Vayne','TOP',54.9,'A','True Dmg + Mobility',                  '14.X'),
('Darius','Kennen','TOP',54.0,'A','Range + Stun',                        '14.X'),
('Darius','Teemo','TOP',53.5,'B','Blind + Range',                        '14.X'),

-- Garen
('Garen','Vayne','TOP',55.0,'S','Kite + True Dmg',                       '14.X'),
('Garen','Teemo','TOP',54.4,'A','Blind cancelt R',                       '14.X'),
('Garen','Quinn','TOP',53.7,'A','Range advantage',                       '14.X'),

-- Riven
('Riven','Renekton','TOP',55.2,'S','Hard early Counter',                 '14.X'),
('Riven','Pantheon','TOP',54.0,'A','All-In Pressure',                    '14.X'),
('Riven','Malphite','TOP',53.8,'A','Armor + Engage',                     '14.X'),

-- Fiora
('Fiora','Jax','TOP',54.6,'A','Counter Stat-Check',                      '14.X'),
('Fiora','Poppy','TOP',54.0,'A','Stoppt Mobility',                       '14.X'),
('Fiora','Kayle','TOP',53.5,'B','Skaliert besser',                       '14.X'),

-- Camille
('Camille','Malphite','TOP',54.8,'A','Armor + Stun',                     '14.X'),
('Camille','Renekton','TOP',54.1,'A','Earlybully',                       '14.X'),
('Camille','Quinn','TOP',53.0,'B','Range counter',                       '14.X'),

-- Jinx
('Jinx','Draven','BOTTOM',55.5,'S','Frühpressure',                       '14.X'),
('Jinx','Caitlyn','BOTTOM',54.0,'A','Range + Traps',                     '14.X'),
('Jinx','Lucian','BOTTOM',53.5,'A','All-In stark',                       '14.X'),

-- Caitlyn
('Caitlyn','Draven','BOTTOM',54.2,'A','Frühaggro',                       '14.X'),
('Caitlyn','Tristana','BOTTOM',53.6,'B','Late kommt rein',               '14.X'),
('Caitlyn','Samira','BOTTOM',53.0,'B','All-In Range',                    '14.X'),

-- Ezreal
('Ezreal','Draven','BOTTOM',55.0,'S','Bullies harte Lane',               '14.X'),
('Ezreal','Caitlyn','BOTTOM',54.0,'A','Range + Poke',                    '14.X'),
('Ezreal','Miss Fortune','BOTTOM',53.4,'B','Wave Pressure',              '14.X'),

-- Kai'Sa
('Kaisa','Draven','BOTTOM',54.5,'A','Schwach früh',                      '14.X'),
('Kaisa','Caitlyn','BOTTOM',53.8,'A','Range advantage',                  '14.X'),

-- Lee Sin
('LeeSin','Master Yi','JUNGLE',54.2,'A','Skaliert besser',               '14.X'),
('LeeSin','Nocturne','JUNGLE',53.8,'B','Late Game',                      '14.X'),

-- Master Yi
('MasterYi','Rammus','JUNGLE',58.0,'S','Thornmail-King',                 '14.X'),
('MasterYi','Malphite','JUNGLE',55.0,'A','Armor wall',                   '14.X'),
('MasterYi','Jax','JUNGLE',54.5,'A','Dodget Q',                          '14.X'),

-- Kha'Zix
('Khazix','Rengar','JUNGLE',54.6,'A','Mirror counter',                   '14.X'),
('Khazix','Vi','JUNGLE',53.5,'B','Lock-Down',                            '14.X'),

-- Evelynn
('Evelynn','LeeSin','JUNGLE',54.2,'A','Wards stoppen Stealth',           '14.X'),
('Evelynn','Vi','JUNGLE',53.4,'B','Hard CC',                             '14.X'),

-- Thresh
('Thresh','Nautilus','UTILITY',53.8,'B','Bessere Hooks',                 '14.X'),
('Thresh','Morgana','UTILITY',54.5,'A','Black Shield',                   '14.X'),
('Thresh','Leona','UTILITY',53.0,'B','Engage Race',                      '14.X'),

-- Leona
('Leona','Morgana','UTILITY',55.8,'S','Black Shield kontert E',          '14.X'),
('Leona','Janna','UTILITY',54.0,'A','Disengage',                         '14.X'),
('Leona','Lulu','UTILITY',53.4,'B','Polymorph',                          '14.X'),

-- Blitzcrank
('Blitzcrank','Morgana','UTILITY',56.5,'S','Black Shield = win',         '14.X'),
('Blitzcrank','Janna','UTILITY',54.2,'A','Tornado-Disengage',            '14.X'),

-- Lulu
('Lulu','Pyke','UTILITY',54.0,'A','Ignoriert Shields',                   '14.X'),
('Lulu','Blitzcrank','UTILITY',53.8,'B','Hook-Pressure',                 '14.X');

-- ============================================================
-- COUNTER ITEMS
-- ============================================================
-- Item IDs reference (Data Dragon):
--   3047 Plated Steelcaps, 3111 Mercury's Treads
--   6664 Heartsteel, 3742 Dead Man's Plate, 3193 Gargoyle Stoneplate
--   3075 Thornmail, 3110 Frozen Heart, 3143 Randuin's Omen
--   3814 Edge of Night, 3156 Maw of Malmortius, 3139 Mercurial Scimitar
--   3102 Banshee's Veil, 3001 Evenshroud, 3065 Spirit Visage
--   3033 Mortal Reminder, 3036 Lord Dominik's Regards, 3026 Guardian Angel
--   3140 Quicksilver Sash, 3091 Wit's End, 6035 Silvermere Dawn

insert into counter_items (champion_id, item_id, reason, priority) values
-- vs Yasuo
('Yasuo','3047','Reduziert AA-Schaden',1),
('Yasuo','3814','Lethality + Spell-Shield bei Bedarf',2),
('Yasuo','3156','Magic Shield für Yasuo+Magier-Mix',3),
-- vs Yone
('Yone','3047','Tank Boots gegen Crit',1),
('Yone','3814','Spell-Shield Pop',2),
-- vs Zed
('Zed','3814','Edge of Night blockt R-Mark',1),
('Zed','3156','Maw + Magic Shield',2),
('Zed','6035','Silvermere Dawn cleanst',3),
-- vs Akali
('Akali','3001','Evenshroud reduziert Burst',1),
('Akali','3140','QSS gegen R',2),
('Akali','3211','Hexdrinker Magic-Shield',3),
-- vs Katarina
('Katarina','3140','QSS cancelt R',1),
('Katarina','3001','Evenshroud',2),
('Katarina','3102','Banshee Pop',3),
-- vs Darius
('Darius','3047','Boots gegen AA',1),
('Darius','3143','Randuin gegen Bleed',2),
('Darius','3742','Dead Man kited',3),
-- vs Garen
('Garen','3110','Frozen Heart Armor',1),
('Garen','3047','Boots',2),
-- vs Riven
('Riven','3047','Plated Steelcaps',1),
('Riven','3143','Randuin gegen Burst',2),
('Riven','3193','Gargoyle Stoneplate',3),
-- vs Fiora
('Fiora','3110','Frozen Heart cuts AS',1),
('Fiora','3075','Thornmail kontert Heal',2),
-- vs Camille
('Camille','3110','Frozen Heart',1),
('Camille','3047','Plated Steelcaps',2),
-- vs Jinx
('Jinx','3047','Boots gegen AA',1),
('Jinx','3110','Frozen Heart',2),
('Jinx','3143','Randuin Crit-Reduce',3),
-- vs Caitlyn
('Caitlyn','3814','Edge of Night',1),
('Caitlyn','3047','Boots',2),
-- vs Ezreal
('Ezreal','3102','Banshee gegen Q',1),
('Ezreal','3156','Maw of Malmortius',2),
-- vs Kaisa
('Kaisa','3047','Boots',1),
('Kaisa','3091','Wit''s End MR + AS',2),
-- vs Lee Sin
('LeeSin','3193','Gargoyle Stoneplate',1),
('LeeSin','3111','Mercury Treads',2),
-- vs Master Yi
('MasterYi','3075','Thornmail counter Heal',1),
('MasterYi','3110','Frozen Heart',2),
('MasterYi','3143','Randuin Crit',3),
-- vs Khazix
('Khazix','3026','Guardian Angel',1),
('Khazix','3814','Edge of Night',2),
-- vs Evelynn
('Evelynn','3364','Pink Ward / Oracle',1),
('Evelynn','3102','Banshee Veil',2),
('Evelynn','3140','QSS',3),
-- vs Thresh
('Thresh','3140','QSS gegen Hook',1),
('Thresh','3102','Banshee',2),
-- vs Leona
('Leona','3111','Mercury Treads gegen CC',1),
('Leona','3140','QSS',2),
-- vs Blitzcrank
('Blitzcrank','3102','Banshee Pop Hook',1),
('Blitzcrank','3140','QSS',2),
-- vs Lulu
('Lulu','3814','Edge of Night',1),
('Lulu','3033','Mortal Reminder',2);
