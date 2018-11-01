<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

<style>
  html { font-size: 14px; }

  html, body, #app { height: 100%; }

  body {
    background-color: #f1f1f1;
  }

  .center-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
  }

    .center-container > form {
      width: 100%;
      max-width: 400px;
      padding: 0 15px;
      margin: 0px auto;
    }

  .search-form { margin-bottom: 1rem; }

  .align-center { display: flex; align-items: center; }

  .tab-content { margin-bottom: 15px; }

  .badge { padding: 5px 7px; }

  .image-upload-input { font-size: .8rem; }
  .svg-content {
    display: inline-block;
    position: absolute;
    top: 0;
    left: 0;
  }

  .like {
    fill: green !important;
  }

  .dislike {
    fill: orangered !important;
  }

  .neutral {
    fill: gray !important;
  }

  #tooltip {
    position: absolute;
    width: auto;
    height: auto;
    padding: 10px;
    background-color: #3d3d3d;
    -webkit-border-radius: 10px;
    -moz-border-radius: 10px;
    border-radius: 10px;
    -webkit-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    -moz-box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    box-shadow: 4px 4px 10px rgba(0, 0, 0, 0.4);
    pointer-events: none;
    text-align: center;
  }

  #tooltip.hidden {
    display: none;
  }

  #tooltip p {
    margin: 0;
    font-family: Futura;
    text-align: center;
    color: white;
    font-size: 16px;
    line-height: 20px;

  }

  #itemImage {
    margin-top: 10px;
    padding-top: 75%;
    background-size: cover;
  }
</style>
