-- AIHW Dementia Mortality Data (2009-2023)
-- Source: AIHW Table S3.3 Deaths due to dementia in Australia by sex
-- Includes: number of deaths, age-standardised rates, and crude rates

DROP TABLE IF EXISTS dementia_mortality;

CREATE TABLE dementia_mortality (
    year                  SMALLINT      NOT NULL PRIMARY KEY,
    deaths_men            INTEGER       NOT NULL,
    deaths_women          INTEGER       NOT NULL,
    deaths_persons        INTEGER       NOT NULL,
    asr_men               NUMERIC(8,6)  NOT NULL,
    asr_women             NUMERIC(8,6)  NOT NULL,
    asr_persons           NUMERIC(8,6)  NOT NULL,
    crude_men             NUMERIC(8,6)  NOT NULL,
    crude_women           NUMERIC(8,6)  NOT NULL,
    crude_persons         NUMERIC(8,6)  NOT NULL
);

INSERT INTO dementia_mortality (
    year,
    deaths_men, deaths_women, deaths_persons,
    asr_men, asr_women, asr_persons,
    crude_men, crude_women, crude_persons
)
VALUES

    (2009, 2898, 5560, 8458, 30.999679, 33.716708, 33.182609, 26.831353, 51.052002, 38.991957),
    (2010, 3045, 6161, 9206, 31.381993, 36.087799, 34.677188, 27.763010, 55.685513, 41.785151),
    (2011, 3379, 6682, 10061, 33.339383, 37.896456, 36.521589, 30.391517, 59.544868, 45.035762),
    (2012, 3550, 7060, 10610, 33.375040, 38.601377, 37.027820, 31.379887, 61.818735, 46.671284),
    (2013, 3875, 7461, 11336, 35.053205, 39.768951, 38.343148, 33.677598, 64.197411, 49.013909),
    (2014, 4367, 8060, 12427, 37.617255, 41.805625, 40.578445, 37.427517, 68.259964, 52.935620),
    (2015, 4640, 8443, 13083, 38.381916, 42.470847, 41.280219, 39.230102, 70.426747, 54.933670),
    (2016, 5095, 8793, 13888, 40.330318, 42.828624, 42.261783, 42.447583, 72.145514, 57.410001),
    (2017, 5306, 9234, 14540, 40.397283, 43.855410, 42.882072, 43.479020, 74.533855, 59.123505),
    (2018, 5346, 9371, 14717, 39.305914, 43.432102, 42.138905, 43.146930, 74.532510, 58.954644),
    (2019, 5869, 9907, 15776, 41.548746, 44.772452, 43.799227, 46.663726, 77.655641, 62.270015),
    (2020, 5662, 9700, 15362, 38.364537, 42.566381, 41.134143, 44.482368, 75.073861, 59.892594),
    (2021, 6082, 10589, 16671, 39.547864, 45.135555, 43.100607, 47.704168, 81.856821, 64.904546),
    (2022, 6556, 11272, 17828, 41.102604, 47.007104, 44.858349, 50.781753, 86.017895, 68.531278),
    (2023, 6519, 10890, 17409, 39.582046, 44.918275, 42.904216, 49.264732, 81.146410, 65.317772);

-- Replicates the age-standardised rate chart (Men / Women / Persons lines)
CREATE OR REPLACE VIEW v_mortality_asr_by_sex AS
SELECT year, asr_men, asr_women, asr_persons
FROM dementia_mortality
ORDER BY year;

-- Death counts by sex
CREATE OR REPLACE VIEW v_mortality_deaths_by_sex AS
SELECT year, deaths_men, deaths_women, deaths_persons
FROM dementia_mortality
ORDER BY year;

-- Crude rates by sex
CREATE OR REPLACE VIEW v_mortality_crude_by_sex AS
SELECT year, crude_men, crude_women, crude_persons
FROM dementia_mortality
ORDER BY year;
