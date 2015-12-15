/// <reference path="babylon.d.ts" />

var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BABYLON;
(function (BABYLON) {
    var GrassMaterial = (function (_super) {
        __extends(GrassMaterial, _super);
        /**
        * Constructor
        */
        function GrassMaterial(name, scene, numberOfSlices, numberOfPlanes) {
            if (numberOfSlices === void 0) { numberOfSlices = "8.0"; }
            if (numberOfPlanes === void 0) { numberOfPlanes = "64.0"; }
            _super.call(this, name, scene, "grassMat", {
                needAlphaBlending: true,
                needAlphaTesting: true,
                attributes: ["position", "normal", "uv"],
                uniforms: ["worldViewProjection", "world", "cameraPosition", "time", "lightPosition"],
                samplers: ["bladesSampler", "groundSampler", "windSampler"],
                defines: [
                    "#define PLANE_NUM " + numberOfPlanes, "#define GRASS_SLICE_NUM " + numberOfSlices,
                    scene.getEngine().getCaps().fragDepth ? "#define COMPUTE_DEPTH" : ""
                ]
            });
            /*
            * Public members
            */
            this.bladesTexture = null;
            this.groundTexture = null;
            this.windTexture = null;
            this.lightPosition = new BABYLON.Vector3(308, 455, 343);
            /*
            * Private members
            */
            this._lastTime = 0;
            this.onBind = this._bindMaterial();
        }
        GrassMaterial.prototype._bindMaterial = function () {
            var _this = this;
            return function (material, mesh) {
                var effect = _this.getEffect();
                _this._lastTime += _this.getScene().getEngine().getDeltaTime() / 1000;
                effect.setTexture("bladesSampler", _this.bladesTexture);
                effect.setTexture("groundSampler", _this.groundTexture);
                effect.setTexture("windSampler", _this.windTexture);
                effect.setVector3("lightPosition", _this.lightPosition);
                effect.setVector3("cameraPosition", _this.getScene().activeCamera.position);
                effect.setFloat("time", _this._lastTime);
            };
        };
        return GrassMaterial;
    })(BABYLON.ShaderMaterial);
    BABYLON.GrassMaterial = GrassMaterial;
})(BABYLON || (BABYLON = {}));
/// <reference path="babylon.d.ts" />
var BABYLON;
(function (BABYLON) {
    var Utils = (function () {
        function Utils() {
        }
        Utils.makePlanarMapping = function (mesh, resolution) {
            if (!mesh.getVertexBuffer(BABYLON.VertexBuffer.PositionKind) || !mesh.getVertexBuffer(BABYLON.VertexBuffer.UVKind)) {
                return;
            }
            var idxcnt = mesh.getIndices().length;
            var indices = mesh.getIndices();
            var positions = mesh.getVertexBuffer(BABYLON.VertexBuffer.PositionKind).getData();
            var uvs = mesh.getVertexBuffer(BABYLON.VertexBuffer.UVKind).getData();
            for (var i = 0; i < uvs.length; i++) {
                uvs[i] /= resolution;
            }
            mesh.geometry.updateVerticesData(BABYLON.VertexBuffer.UVKind, uvs, false);
        };
        return Utils;
    })();
    BABYLON.Utils = Utils;
})(BABYLON || (BABYLON = {}));
