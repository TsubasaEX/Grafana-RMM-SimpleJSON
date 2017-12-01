import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.scope = $scope;
    this.target.scada = this.target.scada || 'select device';
    this.target.device = this.target.device || 'select plugin';
    this.target.tag = this.target.tag || 'select sensor';
    this.target.type = this.target.type || 'timeserie';
    //this.target.mode = this.target.mode || 'Continuous';

  }

  /*getOptions(query) {
    return this.datasource.metricFindQuery(query || '');
  }*/

  getDeviceOptions(query) {
    //this.target.device = 'select plugin';
    //this.target.tag = 'select sensor';
    return this.datasource.metricFindQuery_device(query);
  }

  getPluginOptions(query) {
    //this.target.tag = 'select sensor';
    return this.datasource.metricFindQuery_plugin(this.target.scada);
  }

  getSensorOptions(query) {
    return this.datasource.metricFindQuery_sensor(this.target.scada, this.target.device);
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal_scada() {
    this.target.device = 'select plugin';
    this.target.tag = 'select sensor';
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  onChangeInternal_device() { 
    this.target.tag = 'select sensor';
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  onChangeInternal_tag() {    
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

