-- 1. PATIENT TABLE
CREATE TABLE IF NOT EXISTS PATIENT (
    patient_id          VARCHAR(50) PRIMARY KEY, 
    name                VARCHAR(100) NOT NULL,
    age                 INTEGER NOT NULL CHECK (age > 0 AND age < 131),
    gender              VARCHAR(20) NOT NULL,
    cache_session_id    INT
);


-- 2. RECORDING TABLE
CREATE TABLE IF NOT EXISTS RECORDING (
    recording_id        INT PRIMARY KEY,
    upload_timestamp    TIMESTAMPTZ DEFAULT NOW(),
    text_transcript     TEXT,
    patient_id          VARCHAR(50) NOT NULL, 

    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id)
);


-- 3. BIOMARKER_ANALYSIS TABLE
CREATE TABLE IF NOT EXISTS BIOMARKER_ANALYSIS (
    analysis_id          SERIAL PRIMARY KEY,
    MLU_score            FLOAT,
    pause_ratio          FLOAT,
    type_token_ratio     FLOAT,
    filler_word_count    INT,
    syntactic_complexity FLOAT,
    analysis_timestamp   TIMESTAMPTZ DEFAULT NOW(),
    recording_id         INT,
    risk_id              INT,
    patient_id           VARCHAR(50) NOT NULL,

    FOREIGN KEY (recording_id) REFERENCES RECORDING(recording_id),
    FOREIGN KEY (patient_id) REFERENCES PATIENT(patient_id),
--  FOREIGN KEY (risk_id) REFERENCES RISK_ASSESSMENT(risk_id)
--  Removed the foreign key from biomarker_analysis to risk_assessment to avoid a circular dependency. 
--  Keeping both directions would make data insertion difficult, since each table would depend on the other existing first.
);


-- 4. RISK_ASSESSMENT TABLE
CREATE TABLE IF NOT EXISTS RISK_ASSESSMENT (
    risk_id             INT PRIMARY KEY,
    dementia_risk_level VARCHAR(50),
    confidence_score    FLOAT,
    trend_direction     VARCHAR(50),
    analysis_id         INT,

    FOREIGN KEY (analysis_id) REFERENCES BIOMARKER_ANALYSIS(analysis_id)
);


-- 5. INSERT INTO PATIENT
INSERT INTO PATIENT (patient_id, name, age, gender, cache_session_id) VALUES
('PT-2024-001', 'Aileen Hernandez', 72, 'Female', 1001),
('PT-2024-002', 'B B King', 75, 'Male', 1002),
('PT-2024-003', 'Charmian Carr', 73, 'Female', 1003),
('PT-2024-004', 'David Prowse', 80, 'Male', 1004),
('PT-2024-005', 'Evelyn Keyes', 78, 'Female', 1005),
('PT-2024-006', 'Jesse Helms', 79, 'Male', 1006),
('PT-2024-007', 'Maurice Hinchey', 76, 'Male', 1007),
('PT-2024-008', 'Omar Sharif', 82, 'Male', 1008),
('PT-2024-009', 'Stella Stevens', 77, 'Female', 1009),
('PT-2024-010', 'Viv Nicholson', 74, 'Female', 1010);


-- 6. INSERT INTO RECORDING
-- The recording timestamps are assigned according to the audio file naming convention,
-- which represents recordings from different time periods. 
-- The intervals between timestamps are intentionally set (e.g., 3–4 years apart) to reflect temporal progression, rather than being randomly generated.
INSERT INTO RECORDING (recording_id, upload_timestamp, text_transcript, patient_id) VALUES
-- Aileen Hernandez
(1, '2015-06-15 10:00:00',
'[00:00:00 - 00:00:23] Well this is not gonna sound like very ladylike and what my mother did was she took me by the hand, she took me down to the person who had come up with this idea of having a petition, and she walked right in and into the kitchen and she said to him, "What, what made you decide that you should have us not living in this neighborhood? Who are you to make that decision?"
[00:00:24 - 00:00:46] So part of it I learned very quickly that if you''ve got an issue, you better start speaking up very early on it. What was nice about the end of it was the, the, uh, principal at the school called all of the people together and told them that if they tried to get us out of the ne- out of the neighborhood, he would make sure that we could go into his house and we could still stay there.',
'PT-2024-001'), -- Just after symptom onset

(2, '2020-08-20 11:30:00',
'[00:00:00 - 00:00:37] I arrive at my first political science class. The teacher looks down at me, and then he says, "If you are not prepared to do all of the work that we''re talking about, I would suggest that you leave now and sign up for home economics." And I look around, and for the first time, I discover I''m the only girl in the room. I would not move ''cause I knew my mother would not, never forgive me if I did. [laughs] I did very well in college, and I saw an ad that said, "Would you like a job that doesn''t pay a lot of money but gives lots of satisfaction to you in terms of what you''re doing in the society?" And I said, "They''re talking to me."',
'PT-2024-001'), -- 5 years after symptom onset

(3, '2020-10-10 09:45:00',
'[00:00:00 - 00:01:29] We are more conscious in this state now about the places where inequity ex- ac- actually exist, and we do try to pass laws, and we do see some changes. I can remember, for example, when the, the issues around disability first came into play, and people said, "This is incredible. We can''t do all of these things. It will cost a fortune for us to do it." And what these things were, was such things as how do we make sure that people in wheelchairs can get up on a sidewalk and, or get into an elevator or do any of those things. And this was horrifying to people. It was gonna cost fortunes to, you know, to carve out all these curbs so that you could get people on their, on their wheelchairs in there. Well, what has turned out to happen is that by doing that for what was considered, quote, "a small group of people," we have incredibly improved the ability of a lot of other people to use them as well. For example, any parent who has a child in a stroller is now using those curbed, those carved-out curbs. They would not have been able [chuckles] to do that before, but they found it works. So it didn''t just help a small group of people. Once it was done, it opened up a lot of groups of people. I''m sure that any delivery company that has to deliver also appreciates those curbs being carved out. And we''ve also learned that w-- our stereotypes begin to fall away once we have the experience with them because we have found that we have lost a lot of ti-',
'PT-2024-001'), -- 5 years after symptom onset


-- B B King
(4, '2008-05-12 14:20:00',
'[00:00:00 - 00:00:04] When I''m feeling bad and good for me when I''m feeling good
[00:00:04 - 00:00:05] Mm-hmm.
[00:00:05 - 00:00:08] It''s kinda like religious music is to a lot of people',
'PT-2024-002'), -- Just after symptom onset

(5, '2018-07-18 10:15:00',
'[00:00:00 - 00:00:08] Anyone else other than I was a Black kid instead of being a white kid, and it was a segregated society. Um,
[00:00:09 - 00:00:13] we walked to school. The white kids had a school bus.
[00:00:14 - 00:00:15] And, um,
[00:00:16 - 00:00:17] I was crazy about Roy Rogers.
[00:00:18 - 00:00:22] I like, uh, William Elliott, we called him Wild Bill.
[00:00:23 - 00:00:27] No different thing than being white. [laughs] Those cowboys, my heroes.
[00:00:29 - 00:00:29] Uh,
[00:00:31 - 00:00:32] I think trying to answer your question,
[00:00:34 - 00:00:47] I had never experienced the North. I didn''t know anything about the North. I didn''t know anything about any other society other than what we lived in. So to answer your question, truthfully,
[00:00:49 - 00:00:50] like all right with me,
[00:00:51 - 00:00:54] just that some people had and some had not,
[00:00:55 - 00:00:59] and I wished I could have been one of those that had. Now that''s the truth.
[00:01:00 - 00:01:01] Well, I,
[00:01:03 - 00:01:08] I guess I was an average, uh, Afro-American boy, or American boy, really.
[00:01:09 - 00:01:11] Um, I used to hunt, fish,
[00:01:13 - 00:01:16] um, played. I''d shoot marbles, was never good at any of it.
[00:01:17 - 00:01:17] Um,
[00:01:19 - 00:01:25] the school I went to, we didn''t have a football team or basketball team.
[00:01:26 - 00:01:29] Um, we played something called-',
'PT-2024-002'), -- 10 years after symptom onset

(6, '2023-09-05 16:40:00',
'[00:00:00 - 00:00:05] No, not necessarily when I was doing the music. I''m talking about at times, just times in your life
[00:00:05 - 00:00:05] Oh, right
[00:00:05 - 00:00:08] ... times in your life you feel that,
[00:00:09 - 00:00:27] for example, you might lose a close friend or something happens that don''t necessarily have to be bad for you, but bad for somebody else. Bad in a lot of cases for people you don''t even know, and you still feel s- you know, uh, empty in a way of speaking
[00:00:27 - 00:00:27] Mm-hmm
[00:00:27 - 00:00:34] ... ''cause you can''t do anything to help them. You don''t know, uh, well, you''re just, you''re just there.
[00:00:34 - 00:00:34] Yeah.
[00:00:34 - 00:00:41] For example, a few, what? A month ago or so, I was in Europe and I read about JFK Jr.
[00:00:41 - 00:00:42] Right.
[00:00:42 - 00:00:45] Well, I had a chance to meet him when he was a teenager.
[00:00:45 - 00:00:46] Mm-hmm.
[00:00:46 - 00:00:53] His mother brought he and his sister by. We were playing in Manhattan one night and, um,
[00:00:54 - 00:01:11] the ex First Lady at that time, it was after the president was dead, brought the kids by while we were playing, so I had a chance to see him, meet him. And then reading about he and his wife and sister-in-law was all killed at one time, this hurt.
[00:01:11 - 00:01:11] Yeah, I think-
[00:01:11 - 00:01:17] Uh, it would have hurt me if I didn''t, if I had not met him, but I had met him',
'PT-2024-002'), -- 15 years after symptom onset


-- Charmian Carr
(7, '2013-04-22 13:10:00',
'[00:00:00 - 00:00:45] thing that was shot on Sound of Music was my scene where I am all wet and come into the window to see Maria. And I was supposed to be nervous ''cause I didn''t want her to tell on me. And so I was nervous anyway [laughs] so it just worked to the benefit of the film. And Julie Andrews was so kind to me and wonderful with the children. She would tell us jokes, and she made it much easier. In fact, when I watched the new DVD, I watched Julie Andrews'' segment, and at the end of her segment, I, the tears were rolling down my eyes. I mean, it was very nostalgic. The tears are gonna roll [laughs] down my eyes again. I''m sorry. [laughs] But it''s been a wonderful, wonderful-',
'PT-2024-003'), -- 5 years after symptom onset

(8, '2023-06-18 15:25:00',
'[00:00:00 - 00:00:28] One of those things that I was definitely in the right place at the right time. They had actually been looking for an actress to play Liesl for months. They had interviewed in New York, London, and LA and couldn''t find anyone. They started rehearsals without Liesl. And my mother was in Vaudeville, and an agent friend of hers knew she had three daughters and said, "Do you have one daughter who''s over 18, who looks 16, and can sing and dance and act?"
[00:00:28 - 00:00:28] [laughs]
[00:00:28 - 00:01:25] They wanted an actress over 18 because they didn''t want her to have to go to school on the set, ''cause the role of Liesl was larger than that of the other children and they didn''t wanna lose that time every day. So I went in, I met the casting agent. There was nobody there. I, I couldn''t get nervous and I couldn''t compare myself to anyone ''cause there was no one there, and I didn''t know about The Sound of Music. I had never seen the play, and I hadn''t really been clamoring to be an actress. I was working and going to college and saving money to travel. And I met with the casting director and he had me come back the next day and read the 16 Going On 17 scene, which I did, and then he called me back again and I met the director and read the scene for him. And then I had to come back the next day to sing 16 Going On 17. And my mother and father both sang. It''s just a genetic quality that I''ve inherited.
[00:01:25 - 00:01:25] Aren''t you lucky?
[00:01:25 - 00:01:49] Our whole family sings. So I sang 16 Going On 17, and then they called me back the next day and I danced for the choreographers. And I had studied dance since the time I was four, so that was the easy part of it. And I was hired, but I was only hired temporarily. They were afraid that my eyes were too blue and would not photograph well. This was in the days before they could digitize anything.',
'PT-2024-003'), -- 15 years after symptom onset


-- David Prowse
(9, '2012-02-14 12:00:00',
'[00:00:00 - 00:00:04] Now I play the Imperial March. [laughs] I think that would probably be one of the last things that I would play.
[00:00:05 - 00:00:07] I''m lumbered with the situation. I mean, it''s, uh,
[00:00:08 - 00:00:44] um, I''m still, I''m still, uh, sort of being ostracized, as it were. I mean, s- silly things like, you know, for instance, um, they''ve stopped me from doing the Disney Star Wars weekends. I, I used to love doing the Disney Star Wars weekends, and it was a, it was a, it was a, it was a sort of lovely, lovely, um, a lovely job to have every year doing the Disney Star Wars weekends out in the, out in Florida. And then, uh, I mean, that, that''s one thing which, uh, which they, which they put the, w- w- put the block on. Um, and oth- other things have cropped up which they, which, uh, they, they haven''t, you know, or have stopped me from doing and, uh, yeah',
'PT-2024-004'), -- Just after symptom onset

(10, '2017-03-22 11:50:00',
'[00:00:00 - 00:00:12] My, my brother had, had a prostate first. And, uh, we organized a cha- a charity golf tournament for, you know, in, in aid of the prostate, uh, charity. And, uh, uh, we raised about 1,000 pounds for the charity.
[00:00:12 - 00:00:12] Mm.
[00:00:12 - 00:00:43] And when I, I presented the check to the lady from the prostate cancer charity, and, uh, and she said to me, she said, "Have you ever been tested?" And I said, "No, no, I''m perfectly all right, thank you very much. There''s nothing wrong with me." And, uh, so then she said, "Well," she said, "All men over 50 ought to be tested." And, uh, so the next time I went to see my doctor I said, "Do, do me a favor. Can you give me a chit, um, to go and get a blood test done?" Had the blood test done. Next thing I know, the, uh, they called me up and said that, "We wanna do a biopsy." And they did the biopsy, took 12 samples, and then came back and they said, "Well, 10 of the samples that you had, uh, were suspicious. Um, in other words, you''ve got prostate cancer." [laughs]
[00:00:43 - 00:00:44] Gosh.
[00:00:44 - 00:00:55] And, uh, so they said, "How would you want it treated?" And I said, "Well, what, what''s the options?" And, uh, I opted to go for the radiotherapy, and so had, uh, had 39, 39 sessions of radiotherapy at the Royal Marsden Hospital in Sutton.
[00:00:55 - 00:00:56] Mm.
[00:00:55 - 00:00:56] And at the end of it, that, that was the end of it.',
'PT-2024-004'), -- 5 years after symptom onset

(11, '2022-07-30 10:30:00',
'[00:00:00 - 00:00:04] I did this, um, uh, uh, Stanley Kubrick rang me up one day and said he was doing this film, um,
[00:00:05 - 00:00:22] A Clockwork Orange, and asked me if I would go up to this house in, um, in, I think it was in Ravet, up in, you know, up in North London. And, uh, and, you know, we, we, we filmed this, uh, we filmed this, this, this terrible movie [laughs]. Like, you know, it was quite strange actually because, I mean, I, I mean, the fir- the first scene I did-
[00:00:22 - 00:00:22] Really?
[00:00:22 - 00:01:29] ... I was, I was doing nothing else but carrying Alex, who was Malcolm McDowell, down the stairs. Oh, and we, I did it all day long, you know, non-stop. You know, and, uh, and at the end of the day, I could hardly move, I could hardly move my arms, like, you know. And then Stanley turns around to me, he said, oh, he said to- next day he said, "We''re gonna do this scene where you''re gonna carry, um, Patrick Magee down the stairs in his wheelchair." I said, "Hang on a minute." I said, oh, I said, I said, "Your name''s not One Take Kubrick, is it?" Like, you know. And he said, "Oh, we do it as quick as we can." You know, and we, and we shot the scene in about three or four takes. He was a hard taskmaster to work for, but a lo- lovely guy. I loved him. I, I got, got on very, very well with him. And then, of course, you know, that w- that came out in 1971, I think it was. And luckily for me, George Lucas saw it, you know, ''cause it was out very, very briefly, you know. ''Cause it was a... It created a, a, a lot of bad publicity, you know, over the content of the film. And, um, uh, anyway, as, as I said, Lucas saw it in the very brief period that it was out and then remembered me for five years, and then came to, came to London and, um, set himself up in the 20th Century Fox offices in London, Central London. And got in touch with the managing director and said, "Look, do me a favor. Can you, can you find me this guy, Dave Prowse?" You know. And then I got called in and they said to me, they said-',
'PT-2024-004'), -- 10 years after symptom onset


-- Evelyn Keyes
(12, '2011-01-10 09:20:00',
'[00:00:00 - 00:00:01] To go through-
[00:00:01 - 00:00:04] Well, I was under contract. He was on the Paramount lot.
[00:00:04 - 00:00:05] Mm-hmm.
[00:00:05 - 00:00:07] He had his special, mm,
[00:00:08 - 00:00:12] place over there, his, his, you know, his bungalow-
[00:00:12 - 00:00:12] Right, right, right
[00:00:12 - 00:00:27] ... everything. Made pictures through. So I was on the Paramount lot, and they had schools. I went to all kinds of schools. I got rid of the accent there. I learned to act. They had a stage. You would do ... You wouldn''t do whole plays, you''d do pieces of plays.
[00:00:27 - 00:00:27] Right.
[00:00:27 - 00:00:29] So that''s where I went to, where I learned my-',
'PT-2024-005'), -- Just after symptom onset

(13, '2021-05-18 14:10:00',
'[00:00:00 - 00:00:38] Well, there''s no other way anymore. I mean, I''ve, I''ve read Truman Capote, and I''ve read Erica Jong, and there''s a new era. I mean, there''s no way you could tell a story without going all out. And I was invited, with money, t-to do, uh, the autobiography, and I don''t... Well, who, who... Evelyn Keyes, who the hell is she? Who remembers? And if anybody remembers, who cares? So with that half-baked career I had, you know, that wasn''t very interesting, and that is, wouldn''t be much of a story. So what do I have to offer?
[00:00:39 - 00:00:48] A dream. It''s an American dream of a f- rather a large number of us, uh, to go to Hollywood and be a star. Mm?
[00:00:50 - 00:00:51] Uh,
[00:00:52 - 00:01:02] and then what happens? You know, it looks good from a distance. Then you get there, and how do I clean this up? All things break loose-',
'PT-2024-005'), -- 10 years after symptom onset


-- Jesse Helms
(14, '2010-02-10 10:00:00',
'[00:00:00 - 00:00:10] nine years handed me a clipping quoting a nineteen seventy-three statement by a longtime friend of a great many of us, Senator Sam J. Ervin Jr.
[00:00:11 - 00:00:13] Senator Ervin is now deceased, of course.
[00:00:14 - 00:00:23] Dot Helms suggested, well, instructed may be a better word, that I share it with you on an appropriate occasion, and this is it.
[00:00:25 - 00:00:28] It was six days before Christmas in nineteen seventy-three,
[00:00:29 - 00:00:39] and unless Senator Ervin were to run again in nineteen seventy-four, Senator Ervin''s Senate career would end on January third, nineteen seventy-five.
[00:00:40 - 00:00:52] And it was on that December day that Senator Ervin issued a public statement that ended speculation as to whether he would or would not seek re-election.
[00:00:53 - 00:01:01] Now, Senator Ervin did not run again in nineteen seventy-four, and he later explained it this way, and I''m quoting.
[00:01:03 - 00:01:29] He said, "There''s one inescapable reality that no man can ignore, and that is that time takes a terrific toll, which is of an increasing nature with those who live many years." End of quote. And then Senator Ervin added, "I would hate to be in the Senate and have to, in Kipling''s words, force my heart and nerves and sinew to serve-',
'PT-2024-006'), -- Just after symptom onset

(15, '2015-06-22 11:30:00',
'[00:00:00 - 00:00:02] For Mexico never existed.
[00:00:03 - 00:00:04] And the fact...
[00:00:07 - 00:00:09] Uh, I''m very fond of Mexico.
[00:00:11 - 00:00:12] I have, uh,
[00:00:13 - 00:00:27] disliked some things, uh, taken by the government, uh, positions taken by the government of Mexico in the past. And yes, uh, I try to be candid as a United States Senator, and I have told the truth about my feelings.
[00:00:28 - 00:00:30] But there''s a new day,
[00:00:31 - 00:00:37] there''s a new day in Washington and a new day here. We have two new great presidents',
'PT-2024-006'), -- 5 years after symptom onset

(16, '2015-09-14 15:20:00',
'[00:00:00 - 00:00:02] I would like for them to say, "Well, he did the best he could."
[00:00:04 - 00:00:05] If they say that, uh,
[00:00:07 - 00:00:08] that''d be enough',
'PT-2024-006'), -- 5 years after symptom onset


-- Maurice Hinchey
(17, '2009-01-15 10:30:00',
'[00:00:00 - 00:00:30] Very much, and it''s a great pleasure for me to be here with all of you, and I, I, I really thank you very much for, for being here with us. And thank you. Thank you very much for, uh, bringing us here and getting us an opportunity to see the operation here more, more closely and to, uh, understand, for example, all the progress that you''ve made, including the fifty percent increase in employment here over the course of the last year or so. Obviously, very, very good and very, very important. Elnamagnetics is a very important place here in, uh, 
[00:00:31 - 00:01:29] the Hudson Valley, and it''s gonna continue to be, and it''s gonna continue to expand because of all the positive things that it''s doing for a whole host of things, including the military operation in, uh, our country. I also want to express my deep appreciation to Senator Gillibrand. She is a great person. We are very fortunate here in New York to have somebody with as much insight, as much intelligence, as much energy and determination to do the right kinds of things. And the main focus of her attention right now, well, maybe one of the main focuses of her attention right now, is on job creation. And job creation is one of the most important things that we need to do. We have, uh, eight point two percent unemployment here in New York, which is a lot better than it is, uh, in other-- Well, not a lot better, but a little bit better at least than it is in o-other places across the, across the country. And a lot of other places are much higher than that, but the average of nine point two percent is, has, has us a little bit lower. In any-',
'PT-2024-007'), -- Just after symptom onset

(18, '2009-04-20 11:10:00',
'[00:00:00 - 00:00:08] Understand what the obligations and mostly the responsibilities are of 
[00:00:08 - 00:00:15] this new circumstance in this job, this job of representing the people here in the Congress of the United States.',
'PT-2024-007'), -- Just after symptom onset

(19, '2014-08-12 14:45:00',
'[00:00:00 - 00:01:28] A, a few words in favor of what, uh, is attempting to be done here in the context of this bill. The TARP situation, which, uh, as we remember, was set up last fall and, uh, in effect rammed through here by the then Secretary of the Treasury, authorized the expenditure of seven hundred billion dollars. And, um, under the last administration, about three hundred and eighty billion dollars had already been spent. So what we''re trying to do here now is to make sure that the rest of this money is spent in appropriate ways. We''ve already set up the Special Inspector General, establishing that piece of responsibility here. And now what we''re doing in the context of this bill is putting into effect all the measures that are going to ensure the effectiveness of that Special Inspector General, to make sure that he has the ability to carry out his responsibilities, to oversee the way in which this money is being allocated, how it is being used, what the impact of its use is. None of that was included in that TARP bill which the previous Secretary of the Treasury came here and, in effect, forced through the Congress. So this is an essential element here. This legislation is critically important. We need to make certain that these economic circumstances are dealt with, but that they''re dealt with',
'PT-2024-007'), -- 5 years after symptom onset


-- Omar Sharif
(20, '2012-03-12 09:40:00',
'[00:00:00 - 00:00:06] made me become somebody. I was good. I could play and all that, but he, to s- to be with next to him- 
[00:00:07 - 00:00:08] Mm 
[00:00:08 - 00:00:09] ... to be near him- 
[00:00:09 - 00:00:09] Yes 
[00:00:09 - 00:00:13] ... he made me fantastic. I used to just sit with him, and he would, made me',
'PT-2024-008'), -- Just after symptom onset

(21, '2022-06-25 13:15:00',
'[00:00:00 - 00:00:03] And it''s, it''s-- He is a strange person because 
[00:00:04 - 00:01:18] he sits there, and he only exists when the boy walks in. He doesn''t talk to the other customers. The fact that the boy is Jewish and the man is Muslim would be an irrelevant thing to the film. It-- The film is not concerned with that problem at all in itself, the story. It-- If the Jews and the-- If the Israelis and the, and the Palestinians had made peace already, it would be totally irrelevant, the whole thing. But where it''s relevant, it''s because there is all that conflict between Israelis and Palestinians, because other conflicts between Islam now and the rest of the world. We''re going towards a very dangerous people because we''re cruising ahead towards a real war of the civ-- of, of cultures and civilizations and religion. And the, the, the powerful Western countries always being on the, on the side of Israel against the Palestin-- I''m not saying that... The-- You should, first of all, before they can solve the Palestinian and the Jewish problem, you have to get rid of... Both Sharon and Arafat must go. These are two incompatible people. They''ve hated each other for ages. They''re not gonna start loving each other now. They''re not going to make deals together. That''s-',
'PT-2024-008'), -- 10 years after symptom onset


-- Stella Stevens
(22, '2007-02-18 10:10:00',
'[00:00:00 - 00:00:06] doing this about four years ago, I think, and I''ve accumulated a lot of photographs because- 
[00:00:06 - 00:00:06] Excellent 
[00:00:06 - 00:00:07] ... the collectors have given me some. 
[00:00:07 - 00:00:08] So now you''re a collector. 
[00:00:08 - 00:00:09] And then I''m not [laughs] 
[00:00:09 - 00:00:09] Okay 
[00:00:09 - 00:00:18] I''m a collector and also a kind of a dealer in that I always have, uh, photos available for my fans, and every year I try to make a new pin-up- 
[00:00:18 - 00:00:19] Excellent. Excellent 
[00:00:19 - 00:00:20] ... because I''m one of the- 
[00:00:20 - 00:00:20] Oh 
[00:00:20 - 00:00:22] ... top pin-ups in the world. 
[00:00:22 - 00:00:22] That''s right. 
[00:00:22 - 00:00:22] Yes. 
[00:00:22 - 00:00:22] Yes, you are. 
[00:00:22 - 00:00:27] And it''s been a difficult thing to be a serious actress and a pin-up because- 
[00:00:27 - 00:00:28] [laughs] You gotta deal with both worlds there 
[00:00:28 - 00:00:30] ... the, well, I know, is that there are two different worlds. 
[00:00:30 - 00:00:30] That''s right. 
[00:00:30 - 00:00:30] And it''s a funny th-',
'PT-2024-009'), -- 15 years after symptom onset


-- Viv Nicholson
(23, '2006-05-14 11:30:00',
'[00:00:00 - 00:00:01] Did it. Instead of just saying he''s dead. 
[00:00:01 - 00:00:02] Yeah. 
[00:00:02 - 00:00:04] Just dramatically. 
[00:00:04 - 00:00:04] Dramatic. 
[00:00:04 - 00:00:08] And I went in, and there was blood all over the place. 
[00:00:08 - 00:00:08] Oh. 
[00:00:08 - 00:00:18] All of it. And because his Uncle Frank was in as well with him. And Uncle Frank, he, Keith got killed out straight away because the steering wheel hit him there. 
[00:00:18 - 00:00:19] Mm-hmm. 
[00:00:19 - 00:00:20] And then Uncle Frank 
[00:00:21 - 00:00:31] got it, and he, his back was broken, and he crawled out the car to go and get help. And he were bleeding all over. 
[00:00:31 - 00:00:31] Yeah. 
[00:00:31 - 00:00:35] And it, it, it was, it was terrible. And, um, 
[00:00:37 - 00:00:48] they put this thing over his head. So I''m just going like that to talk to Keith, you know, and he, he came and went, "Don''t touch that." And I didn''t realize they''d taken everything out here, you see. 
[00:00:50 - 00:00:50] Oh, no. 
[00:00:50 - 00:00:59] And, uh, and I''m just thinking, "You B-A... You did this purposely because why didn''t you tell me you didn''t want me?" You know, because you blame yourself. 
[00:00:59 - 00:01:00] Yeah. Mm-hmm. 
[00:01:00 - 00:01:15] Why didn''t you tell me? Because I said I would have left you. I wouldn''t have spent a honeymoon. [laughs] But I didn''t really, ''cause it took, it takes two to tango, doesn''t it? And, um, and he didn''t answer me. And I went, and I couldn''t touch him. No one could touch him. And, 
[00:01:16 - 00:01:29] um, so Uncle, his uncle and his spine had gone straight through his back. And he, he splattered all... It was in, he splattered all the blood all over because they couldn''t stop it till they arrived. Anyway',
'PT-2024-010'); -- 5 years after symptom onset