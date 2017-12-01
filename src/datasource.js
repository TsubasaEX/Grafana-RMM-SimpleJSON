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

  metricFindQuery_scada(query) {
    var interpolated = {
        target: this.templateSrv.replace(query, null, 'regex')
    };

    return this.doRequest({
      url: this.url + '/searchNode',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  metricFindQuery_device(query) {
    if (query === 'select scada') {
      return this.q.when({data: []});
    }
    var interpolated = {
       scada: query
    };

    return this.doRequest({
      url: this.url + '/searchDevice',
      data: interpolated,
      method: 'POST',
    }).then(this.mapToTextValue);
  }

  metricFindQuery_tag(selScada, selDevice) {
    if (selDevice === 'select device') {
      return this.q.when({data: []});
    }
    var interpolated = {
      scada: selScada,
      device: selDevice
    };

    return this.doRequest({
      url: this.url + '/searchTag',
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
      return (target.node !== 'select scada') && (target.device !== 'select device')&& (target.tag !== 'select tag');
    });

    var targets = _.map(options.targets, target => {
      var scadaId = this.templateSrv.replace(target.scada, options.scopedVars, 'regex');
      var deviceName = this.templateSrv.replace(target.device, options.scopedVars, 'regex');
      var tagName = this.templateSrv.replace(target.tag, options.scopedVars, 'regex');
      var targetName = scadaId + '#' + deviceName + '#' + tagName;
      return {
        target: targetName,
        scada: scadaId,
        device: deviceName,
        tag: tagName,
        refId: target.refId,
        hide: target.hide,
        type: target.type || 'timeserie'
      };
    });

    options.targets = targets;

    return options;
  }

}
