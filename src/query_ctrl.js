import {QueryCtrl} from 'app/plugins/sdk';
import './css/query-editor.css!'

export class GenericDatasourceQueryCtrl extends QueryCtrl {

  constructor($scope, $injector)  {
    super($scope, $injector);

    this.scope = $scope;
    this.target.device = this.target.device || 'select device';
    this.target.plugin = this.target.plugin || 'select plugin';
    this.target.sensor = this.target.sensor || 'select sensor';
    this.target.type = this.target.type || 'timeserie';
    //this.target.mode = this.target.mode || 'Continuous';

  }

  /*getOptions(query) {
    return this.datasource.metricFindQuery(query || '');
  }*/

  getDeviceOptions(query) {
    //this.target.plugin = 'select plugin';
    //this.target.sensor = 'select sensor';
    return this.datasource.metricFindQuery_device(query);
  }

  getPluginOptions(query) {
    //this.target.sensor = 'select sensor';
    return this.datasource.metricFindQuery_plugin(this.target.device);
  }

  getSensorOptions(query) {
    return this.datasource.metricFindQuery_sensor(this.target.device, this.target.plugin);
  }

  toggleEditorMode() {
    this.target.rawQuery = !this.target.rawQuery;
  }

  onChangeInternal_device() {
    this.target.plugin = 'select plugin';
    this.target.sensor = 'select sensor';
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  onChangeInternal_plugin() {
    this.target.sensor = 'select sensor';
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }

  onChangeInternal_sensor() {
    this.panelCtrl.refresh(); // Asks the panel to refresh data.
  }
}

GenericDatasourceQueryCtrl.templateUrl = 'partials/query.editor.html';

