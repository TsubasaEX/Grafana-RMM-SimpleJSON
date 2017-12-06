import _ from "lodash";

export class GenericDatasource {

  constructor(instanceSettings, $q, backendSrv, templateSrv) {
    this.type = instanceSettings.type;
    this.url = instanceSettings.url;
    this.name = instanceSettings.name;
    this.q = $q;
    this.backendSrv = backendSrv;
    this.templateSrv = templateSrv;
    this.withCredentials = instanceSettings.withCredentials;
    this.headers = {'Content-Type': 'application/json'};
    if (typeof instanceSettings.basicAuth === 'string' && instanceSettings.basicAuth.length > 0) {
      this.headers['Authorization'] = instanceSettings.basicAuth;
    }
  }

  query(options) {
    var query = this.buildQueryParameters(options);
    query.targets = query.targets.filter(t => !t.hide);

    if (query.targets.length <= 0) {
      return this.q.when({data: []});
    }

    return this.doRequest({
      url: this.url + '/query',
      data: query,
      method: 'POST'
    });
  }

  testDatasource() {
    return this.doRequest({
      url: this.url + '/',
      method: 'GET',
    }).then(response => {
      if (response.status === 200) {
        return { status: "success", message: "Data source is working", title: "Success" };
      }
    });
  }

  annotationQuery(options) {
    var query = this.templateSrv.replace(options.annotation.query, {}, 'glob');
    var annotationQuery = {
      range: options.range,
      annotation: {
        name: options.annotation.name,
        datasource: options.annotation.datasource,
        enable: options.annotation.enable,
        iconColor: options.annotation.iconColor,
        query: query
      },
      rangeRaw: options.rangeRaw
    };

    return this.doRequest({
      url: this.url + '/annotations',
      method: 'POST',
      data: annotationQuery
    }).then(result => {
      return result.data;
    });
  }

  metricFindQuery(query) {
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };

    return this.doRequest({
      url: this.url + '/search',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  metricFindQuery_device(query) {
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };

    return this.doRequest({
      url: this.url + '/devices',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  metricFindQuery_plugin(query) {
    if (query === 'select device') {
      return this.q.when({data: []});
    }
    var interpolated = {
       device: query
    };

    return this.doRequest({
      url: this.url + '/plugins',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  metricFindQuery_sensor(selDevice, selPlugin) {
    if (selDevice === 'select device' || selPlugin === 'select plugin') {
      return this.q.when({data: []});
    }
    var interpolated = {
      device: selDevice,
      plugin: selPlugin
    };

    return this.doRequest({
      url: this.url + '/sensors',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }


  mapToTextValue(result) {
    return _.map(result.data, (d, i) => {
      if (d && d.text && d.value) {
        return { text: d.text, value: d.value };
      } else if (_.isObject(d)) {
        return { text: d, value: i};
      }
      return { text: d, value: d };
    });
  }

  doRequest(options) {
    options.withCredentials = this.withCredentials;
    options.headers = this.headers;

    return this.backendSrv.datasourceRequest(options);
  }

  buildQueryParameters(options) {
    //remove placeholder targets
    options.targets = _.filter(options.targets, target => {
      return (target.device !== 'select device') && (target.plugin !== 'select plugin')&& (target.sensor !== 'select sensor');
    });

    var targets = _.map(options.targets, target => {
      var device = this.templateSrv.replace(target.device, options.scopedVars, 'regex');
      var plugin = this.templateSrv.replace(target.plugin, options.scopedVars, 'regex');
      var sensor = this.templateSrv.replace(target.sensor, options.scopedVars, 'regex');
      var targetName = device + '|' + plugin + '|' + sensor;
      return {
        target: targetName,
        device: device,
        plugin: plugin,
        sensor: sensor,
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }

}
