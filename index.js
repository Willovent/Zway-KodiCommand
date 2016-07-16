/*** KodiCommand Z-Way HA module *******************************************

Version: 1.00
(c) William Klein, 2016
-----------------------------------------------------------------------------
Author: William Klein <william@klein.net>
Description:
    Creates a toggleButton used to trigger commands on kodi

******************************************************************************/

function KodiCommand(id, controller) {
    // Call superconstructor first (AutomationModule)
    KodiCommand.super_.call(this, id, controller);

    this.vDev = undefined;
}

inherits(KodiCommand, BaseModule);

_module = KodiCommand;

KodiCommand.prototype.init = function (config) {
    KodiCommand.super_.prototype.init.call(this, config);

    var self = this;

    // Create vdev
    self.vDev = this.controller.devices.create({
        deviceId: "KodiCommand_" + self.id,
        defaults: {
            metrics: {
                title: self.langFile.m_title,
                icon: self.imagePath + '/icon.png'
            }
        },
        overlay: {
            probeType: 'general_purpose',
            deviceType: 'toggleButton'
        },
        handler: function (command, args) {
            self.executeCommand();
        },
        moduleId: this.id
    });
};

KodiCommand.prototype.stop = function () {
    var self = this;

    if (self.vDev) {
        self.controller.devices.remove(self.vDev.id);
        self.vDev = undefined;
    }
    KodiCommand.super_.prototype.stop.call(this);
};

// ----------------------------------------------------------------------------
// --- Module methods
// ----------------------------------------------------------------------------


KodiCommand.prototype.executeCommand = function () {
    var self = this;
    var data = {};
    switch (self.config.command) {
        case 'home': data = { method: 'Input.Home' }; break;
        case 'play': data = { method: 'Player.PlayPause', params: [1, 'toggle'] }; break;
        case 'volumeup': data = { method: 'Input.Action', params: { 'volumeup': '10' } }; break;
        case 'volumedown': data = { method: 'Input.Action', params: { 'volumedown': '10' } }; break;
    };
    self.sendToKodi(data);
};

KodiCommand.prototype.sendToKodi = function (data) {
    var self = this;
    data.jsonrpc = '2.0';
    data.id = 1;
    data = JSON.stringify(data)
    http.request({
        url: 'http://' + self.config.host + ':' + self.config.port + '/jsonrpc',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        data: data,
        async: true,
        success: function () { },
        error: function (response) {
            console.error('[KodiCommand] Error calling kodi: ' + response.status);
        },
    });
};