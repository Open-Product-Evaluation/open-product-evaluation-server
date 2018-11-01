<template>

    <tabs>
      <tab name="General" :selected="true" :id="'Allgemeines'">
        <surveyedit></surveyedit>
      </tab>

      <tab name="Questions" :id="'Fragen'">
        <question-list></question-list>
      </tab>

      <tab name="Images" :id="'Bilder'">
        <images></images>
      </tab>

      <tab name="Results" :id="'Ergebnisse'">
        <results></results>
      </tab>

      <tab name="Analysis" :id="'Auswertung'">
        <evaluation></evaluation>
      </tab>

    </tabs>

</template>

<script>
import Tabs from '@/components/misc/Tabs';
import Tab from '@/components/misc/Tab';
import SurveyFormEdit from '@/components/survey/SurveyFormEdit';
import QuestionList from '@/components/question/QuestionList';
import Images from '@/components/images/Images';
import Results from '@/components/results/Results';
import Evaluation from '@/components/evaluation/Evaluation';

export default {
  name: 'Survey',
  components: {
    tabs: Tabs,
    tab: Tab,
    surveyedit: SurveyFormEdit,
    'question-list': QuestionList,
    images: Images,
    results: Results,
    evaluation: Evaluation,
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
