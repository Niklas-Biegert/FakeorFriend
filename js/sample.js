// Entirely invented; two speakers and twenty scenes over nine months.
const scenes = [
  ['13.01.26', '16:05', 'den neuen Kurs', 'die Raumänderung', 'Raum B', 'das grüne Heft', 'die knarzende Tür', 'den Stundenplan'],
  ['27.01.26', '18:15', 'den Gruppenauftrag', 'die Präsentation', 'den Tisch am Fenster', 'den blauen Stift', 'der wacklige Beamer', 'die Reihenfolge'],
  ['10.02.26', '15:40', 'den Bibliotheksbesuch', 'das schwere Buch', 'den Fensterplatz', 'die Karteikarten', 'die flüsternde Uhr', 'die Ausleihe'],
  ['24.02.26', '19:12', 'das Probetraining', 'die erste Runde', 'die Turnhalle', 'die Wasserflasche', 'das quietschende Parkett', 'den Treffpunkt'],
  ['10.03.26', '17:30', 'den Regentag', 'den spontanen Umweg', 'die Bushaltestelle', 'den großen Schirm', 'die nasse Socke', 'den Fahrplan'],
  ['24.03.26', '16:44', 'die kleine Ausstellung', 'das bunte Plakat', 'den Eingang', 'die Eintrittskarte', 'der schiefe Rahmen', 'die Öffnungszeit'],
  ['07.04.26', '18:24', 'das Frühlingsfest', 'die Musikprobe', 'die kleine Bühne', 'die Kopfhörer', 'das tanzende Kabel', 'die Uhrzeit'],
  ['21.04.26', '15:08', 'die Prüfungswoche', 'das Übungsblatt', 'den ruhigen Tisch', 'die Lernnotizen', 'der verlorene Radiergummi', 'den Abgabetag'],
  ['05.05.26', '17:12', 'den ersten freien Nachmittag', 'die Radtour', 'die Brücke', 'die Picknickdecke', 'das Fahrradklingelkonzert', 'die Route'],
  ['19.05.26', '18:36', 'den Pflanzenmarkt', 'das Basilikum', 'den Stand am Tor', 'die Stofftasche', 'die dramatische Tomate', 'den Preis'],
  ['02.06.26', '16:16', 'den Kinoplan', 'den Filmtrailer', 'die letzte Reihe', 'das Popcorn', 'der geheime Abspann', 'den Spielbeginn'],
  ['16.06.26', '17:02', 'das Missverständnis', 'die Nachricht von gestern', 'das Café', 'die Notiz', 'das verwirrte Fragezeichen', 'den Tag'],
  ['30.06.26', '18:50', 'das Gespräch danach', 'die Entschuldigung', 'den Platz draußen', 'die Limonade', 'der versöhnliche Keks', 'die Verabredung'],
  ['14.07.26', '19:20', 'die Ferienliste', 'den See', 'den Steg', 'die Sonnencreme', 'die stolze Badeente', 'die Abfahrt'],
  ['28.07.26', '16:11', 'das Sommerprojekt', 'die Fotowand', 'die Werkstatt', 'das Klebeband', 'die krumme Schere', 'den Entwurf'],
  ['11.08.26', '20:03', 'den Konzertabend', 'die neue Band', 'den Parkeingang', 'die Ohrstöpsel', 'der falsche Takt', 'den Beginn'],
  ['25.08.26', '17:47', 'den Neustart', 'die erste Woche', 'die Treppe', 'den alten Rucksack', 'der fliegende Zettel', 'den Raum'],
  ['08.09.26', '19:05', 'den Kochversuch', 'die Pasta', 'die Küche', 'das frische Basilikum', 'der viel zu große Topf', 'die Zutaten'],
  ['15.09.26', '18:14', 'die ruhige Woche', 'den Spaziergang', 'den kleinen Platz', 'die leichte Jacke', 'die freche Taube', 'die Strecke'],
  ['22.09.26', '19:32', 'das Wiedersehen', 'den Spieleabend', 'den runden Tisch', 'das Kartenspiel', 'der ewige Würfel', 'den Start'],
];
const openings = [
  ['Ich stehe vor dem neuen Kursraum und die Tür klingt wie ein Piratenschiff.', 'Warte, Raum B? Ich laufe gerade zum alten Raum.', 'Ja, die Raumänderung kam eben. Ich halte dir einen Platz frei.', 'Heldentat. Mein grünes Heft hat immerhin den Weg gefunden.'],
  ['Der Beamer hat während der Präsentation einfach aufgegeben.', 'Nicht schon wieder. Hat unsere Skizze trotzdem funktioniert?', 'Ja, wir haben die Reihenfolge erklärt und alle haben genickt.', 'Dann schulde ich dem blauen Stift wohl eine Auszeichnung.'],
  ['Ich bin in der Bibliothek und habe ein Buch gefunden, das mehr wiegt als mein Rucksack.', 'Ist es wenigstens spannend oder nur schwer?', 'Beides. Ich nehme ein paar Karteikarten mit zum Fensterplatz.', 'Ich komme später dazu, wenn die flüsternde Uhr noch Platz lässt.'],
  ['Ich habe das Probetraining überlebt. Das Parkett quietscht lauter als ich.', 'Respekt! Konntest du die erste Runde gut mitmachen?', 'Ja, am Ende sogar mit einem kleinen Sprint.', 'Dann trinken wir erst Wasser und planen in Ruhe die nächste Runde.'],
  ['Bin wegen des Regens an der falschen Haltestelle gelandet.', 'Soll ich dich unter dem großen Schirm abholen?', 'Nur wenn du deine Schuhe nicht auch opfern musst.', 'Die nasse Socke hat schon gekündigt, der Rest macht mit.'],
  ['Das Plakat für die Ausstellung hängt schief. Ich finde es erstaunlich charmant.', 'Noch charmanter als der schiefe Rahmen im Eingang?', 'Knapp dahinter. Wollen wir uns die Bilder ansehen?', 'Sehr gern, ich checke noch die Öffnungszeit.'],
  ['Bei der Musikprobe hat ein Kabel versucht, selbst zu tanzen.', 'Solange du nicht darüber gestolpert bist, bin ich erleichtert.', 'Alles gut. Auf der kleinen Bühne war sogar noch Platz für uns.', 'Dann komme ich zum Frühlingsfest mit Kopfhörern im Gepäck.'],
  ['Ich komme mit dem Übungsblatt heute überhaupt nicht weiter.', 'Klingt anstrengend. Sollen wir es gemeinsam sortieren?', 'Vielleicht später. Im Moment brauche ich eine kurze Pause.', 'Kein Druck. Schreib erst, wenn du wieder Lust hast.'],
  ['Der erste freie Nachmittag gehört definitiv nicht den Hausaufgaben.', 'Abgemacht. Wie wäre es mit der Radtour über die Brücke?', 'Gute Idee. Ich bringe die Picknickdecke mit.', 'Ich kümmere mich um die Route und um ein Klingelkonzert.'],
  ['Die Tomaten auf dem Pflanzenmarkt sehen ernsthaft beleidigt aus.', 'Vielleicht weil du nur Basilikum kaufen wolltest.', 'Ich könnte beiden ein neues Zuhause geben.', 'Solange die Stofftasche das Drama aushält, bin ich dabei.'],
  ['Der Filmtrailer verrät schon wieder fast alles.', 'Dann suchen wir einen anderen Film. Hast du eine Idee?', 'Ich glaube, der mit dem geheimen Abspann könnte lustig sein.', 'Ich schaue nach dem Beginn und rette die letzte Reihe.'],
  ['Ich dachte, wir treffen uns heute. Stehe ich am falschen Tag im Kalender?', 'Oh, das war missverständlich geschrieben. Ich meinte morgen, tut mir leid!', 'Danke fürs Klarstellen. Ich war kurz enttäuscht, aber jetzt ist es wieder gut.', 'Verstehe ich. Nächstes Mal schreibe ich den Tag ausdrücklich dazu.'],
  ['Danke für dein Nachfragen neulich, statt einfach sauer zu sein.', 'Gern. Ich hatte dich zuerst falsch verstanden und wollte es klären.', 'War ein guter Hinweis. Heute habe ich extra den Tag mitgeschrieben 😄', 'Siehst du, unser Kalender lernt mit uns. Limonade später?'],
  ['Der See sieht auf dem Foto aus wie ein vergrößerter Pfützenwitz.', 'Trotzdem will ich hin. Brauchen wir noch irgendwas?', 'Sonnencreme und vielleicht eine Decke.', 'Ich bringe die Badeente nur als moralische Unterstützung mit.'],
  ['Die Fotowand hält bisher nur an einer Ecke.', 'Ich bin gleich in der Werkstatt. Wo ist das Klebeband?', 'Neben der krummen Schere. Nicht die Schere beschuldigen.', 'Ich bringe lieber noch einen Entwurf zum Vergleichen mit.'],
  ['Beim Konzert spielt die Band meinen neuen Lieblingssong.', 'Oh, ich wollte dich gerade fragen, ob du mitkommen magst.', 'Sehr gern. Ich freu mich sogar auf den falschen Takt.', 'Mit dir klingt Warten am Parkeingang schon unterhaltsam 😉'],
  ['Erste Woche zurück, und mein Rucksack hat schon kapituliert.', 'Da passt wohl kein fliegender Zettel mehr hinein.', 'Nur wenn du ihn an der Treppe wieder einfängst.', 'Deal. Danach verrätst du mir, wie dein neuer Raum ist.'],
  ['Meine Pastasoße hat gerade den viel zu großen Topf geerbt.', 'Klingt nach einem feierlichen Abend. Soll ich Basilikum mitbringen?', 'Bitte! Die Zutatenliste ist diesmal sogar lesbar.', 'Du unterschätzt die dramatische Kraft eines guten Topfes.'],
  ['Diese Woche fühlt sich echt voll an. Ein Spaziergang wäre mir lieber als ein voller Plan.', 'Verstehe ich. Wir können zum kleinen Platz laufen und dann schauen.', 'Danke. Ohne Zeitdruck klingt es genau richtig.', 'Ich nehme eine leichte Jacke mit und ignoriere die freche Taube.'],
  ['Der ewige Würfel wartet auf eine Revanche.', 'Heute kann er gewinnen, wenn er sich gut benimmt.', 'Ich bringe das Kartenspiel mit. Bist du noch am runden Tisch?', 'Ja, und ich habe sogar einen Platz für dich freigelassen.'],
];
const offsets = [0, 2, 5, 7, 11, 16, 19, 25, 32, 38, 44, 52, 60, 67, 74, 82, 94, 103, 116, 131];
const lengths = [16, 24, 18, 22, 15, 25, 19, 21, 17, 23, 16, 24, 18, 22, 19, 21, 17, 23, 20, 20];
function dialogue([, , occasion, activity, place, object, joke, detail], index) {
  const lines = [
    `Ich hab gerade an ${occasion} gedacht. Hast du morgen Zeit?`,
    `Vielleicht! Geht es um ${activity} oder etwas ganz anderes?`,
    `Eigentlich um ${activity}. Ich wollte dich zuerst fragen.`,
    `Oh, schön. Was brauchst du für ${activity}?`,
    `Vielleicht ${object}; ich kümmere mich um den Rest.`,
    `Kriege ich für ${occasion} hin. Und wo sehen wir uns?`,
    `Bei ${place}, falls das für dich gut erreichbar ist.`,
    `Ja, das passt. Ich gucke noch mal auf ${detail}.`,
    `Perfekt. Danke, dass du wegen ${detail} mitdenkst.`,
    `Gern. Mein Gehirn hat heute erstaunlich viel Platz für ${activity}.`,
    `Nur solange ${joke} nicht wieder alles übernimmt 😄`,
    `Das klingt nach einem Fall für unser streng geheimes ${occasion}-Chaosprotokoll.`,
    `Übrigens, wie lief dein Tag vor ${occasion} bisher?`,
    `Ein bisschen voll wegen ${detail}, aber jetzt wird es ruhiger. Und deiner?`,
    `Auch turbulent. Deine Nachricht über ${activity} kam gerade genau richtig.`,
    `Dann nehmen wir uns morgen für ${activity} Zeit, ohne irgendeinen Zeitdruck.`,
    `Klingt gut. Ich mag, dass wir ${occasion} einfach besprechen können.`,
    `Ja. Wenn sich der Plan für ${activity} ändert, sagen wir kurz Bescheid, okay?`,
    `Abgemacht. Ich schicke dir vorher noch ein Update zu ${detail}.`,
    `Freu mich. Und vergiss ${object} nicht – ich erinnere dich notfalls 😉`,
    `Ich habe ${object} schon an die Tür gelegt. Diesmal läuft das ohne Suchaktion.`,
    `Sehr gut. Falls ${joke} auftaucht, mache ich ein Beweisfoto nur für mich.`,
    `Für ${activity} reicht ein Foto wahrscheinlich nicht, aber der Gedanke hilft.`,
    `Stimmt. Ich bin bei ${place} ein paar Minuten früher und warte dort.`,
    `Alles klar, dann bis später. Ich wünsche dir vorher noch eine Pause von ${detail}.`,
  ];
  lines.splice(0, 4, ...openings[index]);
  if (index === 11) {
    lines[0] = 'Ich dachte, wir treffen uns heute. Stehe ich am falschen Tag im Kalender?';
    lines[1] = 'Oh, das war missverständlich geschrieben. Ich meinte morgen, tut mir leid!';
    lines[2] = 'Danke fürs Klarstellen. Ich war kurz enttäuscht, aber jetzt ist es wieder gut.';
    lines[3] = 'Verstehe ich. Nächstes Mal schreibe ich den Tag ausdrücklich dazu.';
  }
  if (index === 12) {
    lines[0] = 'Danke für dein Nachfragen neulich, statt einfach sauer zu sein.';
    lines[1] = 'Gern. Ich hatte dich zuerst falsch verstanden und wollte es klären.';
    lines[2] = 'War ein guter Hinweis. Heute habe ich extra den Tag mitgeschrieben 😄';
  }
  if (index === 7) {
    lines[13] = 'Die Aufgaben stressen mich gerade. Ich brauche heute etwas Ruhe.';
    lines[14] = 'Verstehe ich. Du musst jetzt nicht antworten; viel Erfolg und meld dich, wenn es passt.';
  }
  if (index === 15) {
    lines[15] = 'Ich freu mich schon auf den Abend. Mit dir klingt sogar Warten unterhaltsam.';
    lines[16] = 'Das ist süß gesagt. Ich verspreche trotzdem keine perfekte Tanzfigur 😉';
  }
  return lines.slice(0, lengths[index]).map((text, i) => ({ author: (index % 3 === 1) !== (i % 5 === 4 || i % 2 === 1) ? 'Mara' : 'Leo', text }));
}
function stampedScene(scene, index) {
  const [day, start] = scene;
  const [hour, minute] = start.split(':').map(Number);
  return dialogue(scene, index).map(({ author, text }, i) => {
    const total = hour * 60 + minute + (offsets[i] ?? 131 + (i - 19) * 9);
    const clock = `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
    return `[${day}, ${clock}] ${author}: ${text}`;
  });
}
export const SAMPLE_CHAT = scenes.flatMap(stampedScene).join('\n');
