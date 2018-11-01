<template>
  <div class="card">
    <div class="card-header">
      Create New User
    </div>
    <div class="card-body">

      <div class="form-group">
        <label for="input_firstname">Firstname</label>
        <input type="text" name="firstname" id="input_firstname" class="form-control" />
      </div>

      <div class="form-group">
        <label for="input_lastname">Lastname</label>
        <input type="text" name="lastname" id="input_lastname" class="form-control" />
      </div>

      <div class="form-group">
        <label for="input_email">E-Mail</label>
        <input type="text" name="email" id="input_email" class="form-control" />
      </div>

      <div class="form-group">
        <label for="input_email_confirm">Repeat E-Mail</label>
        <input type="text" name="email_confirm" id="input_email_confirm" class="form-control" />
      </div>

      <!--<div class="form-group">
        <label for="input_rights">Rechte</label>
        <select name="rights" id="input_rights" class="form-control">
          <option value="0" selected="selected">User</option>
          <option value="1">Administrator</option>
        </select>
      </div>-->

      <div class="form_group">
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'UserNew',
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>
