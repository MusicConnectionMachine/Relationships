'use strict';
const utils = require('../app/utils.js');
exports.getRelationshipsGET = function(args, res) {
  /**
   * Get the relationships from the given set of text array / file
   * The GetRelationships endpoint returns all the relationships found in the text by running an algorithm on it. The response includes relationship and two entities
   *
   * article String The Path of the file where the text is present
   * occurences List The occurence of entities present in the file
   * returns List
   **/
  let inputdata = "In 1780, Mozart wrote his opera Idomeneo, which became a sensation in Munich. After a conflict with the Archbishop, Mozart left his Konzertmeister post and settled in Vienna. He received a number of commissions now and took on a well-paying but unimportant Court post. In 1782 Mozart married Constanze Weber and took her to Salzburg the following year to introduce her to his family. 1782 was also the year that saw his opera Die Entführung aus dem Serail staged with great success.\
  In 1784, Mozart joined the Freemasons, apparently embracing the teachings of that group. He would later write music for certain Masonic lodges. In the early- and mid-1780s, Mozart composed many sonatas and quartets, and often appeared as soloist in the fifteen piano concertos he wrote during this period. Many of his commissions were for operas now, and Mozart met them with a string of masterpieces. Le nozze di Figaro came 1786, Don Giovanni in 1787, Così fan tutte in 1790 and Die Zauberflöte in 1791. Mozart made a number of trips in his last years, and while his health had been fragile in previous times, he displayed no serious condition or illness until he developed a fever of unknown origin near the end of 1791."

  utils.callDateEventExtraction(inputdata,function (data) {
    res.end(JSON.stringify(data));
  });
};
