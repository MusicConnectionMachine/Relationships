/**
 * Developed by Anshul Jindal
 * @email anshul.jindal@tum.de
 * @github ansjin
 */

import java.util.Properties;
import java.util.*;
import edu.stanford.nlp.coref.CorefCoreAnnotations;
import edu.stanford.nlp.coref.data.CorefChain;
import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.coref.data.CorefChain.CorefMention;
import java.io.BufferedReader;
import java.io.FileReader;
import java.io.BufferedWriter;
import java.io.Writer ;
import java.io.OutputStreamWriter;
import java.io.FileOutputStream;
import java.nio.charset.StandardCharsets;
public class CorefResolve {

  public static void main(String[] args) throws Exception {
    if( args.length > 1 ) 
    {
          BufferedReader br = new BufferedReader(new FileReader(args[0]));
          BufferedWriter bw = null;
          Writer  fw = null;
          String FILENAME = args[1];
      try {
              fw = new OutputStreamWriter(new FileOutputStream(FILENAME), StandardCharsets.UTF_8);
              bw = new BufferedWriter(fw);
              String line = br.readLine();

              while (line != null) 
              {


                    Annotation doc = new Annotation(line);
                    Properties props = new Properties();
                    props.setProperty("annotators", "tokenize,ssplit,pos,lemma,ner,parse,mention,coref");
                    StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
                    pipeline.annotate(doc);

                    Map<Integer, CorefChain> corefs = doc.get(CorefCoreAnnotations.CorefChainAnnotation.class);
                    List<CoreMap> sentences = doc.get(CoreAnnotations.SentencesAnnotation.class);


                    List<String> resolved = new ArrayList<String>();

                    for (CoreMap sentence : sentences) {

                        List<CoreLabel> tokens = sentence.get(CoreAnnotations.TokensAnnotation.class);

                        for (CoreLabel token : tokens) {

                            Integer corefClustId= token.get(CorefCoreAnnotations.CorefClusterIdAnnotation.class);
                            CorefChain chain = corefs.get(corefClustId);
                            if(chain==null){
                                resolved.add(token.word());
                            }else{

                                int sentINdx = chain.getRepresentativeMention().sentNum -1;
                                CoreMap corefSentence = sentences.get(sentINdx);
                                List<CoreLabel> corefSentenceTokens = corefSentence.get(CoreAnnotations.TokensAnnotation.class);

                                String newwords = "";
                                CorefMention reprMent = chain.getRepresentativeMention();
                                for(int i = reprMent.startIndex; i<reprMent.endIndex; i++){
                                    CoreLabel matchedLabel = corefSentenceTokens.get(i-1); //resolved.add(tokens.get(i).word());
                                    resolved.add(matchedLabel.word());

                                    newwords+=matchedLabel.word()+" ";

                                }
                            }
                        }

                    }


                    String resolvedStr ="";
                    System.out.println();
                    for (String str : resolved) {
                        resolvedStr+=str+" ";
                    }

                      resolvedStr=resolvedStr.replaceAll("[^\\p{ASCII}]", "");
                      bw.write(resolvedStr + "\n");
                        line = br.readLine();
                }
            } 
            finally 
            {
              br.close();
              if (bw != null)
                bw.close();

              if (fw != null)
                fw.close();
            }
          }
          else
          {
             System.out.println("Specify Input and output file");
          }

  }
}

