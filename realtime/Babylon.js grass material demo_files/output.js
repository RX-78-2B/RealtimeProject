/// <reference path="babylon.d.ts" />
var BABYLON;
(function (BABYLON) {
    var WaterMaterial = (function () {
        /**
        * Constructor
        */
        function WaterMaterial(name, scene, sourceMesh, renderTargetSize) {
            if (sourceMesh === void 0) { sourceMesh = null; }
            if (renderTargetSize === void 0) { renderTargetSize = new BABYLON.Vector2(512, 512); }
            /*
            * Public members
            */
            this.windForce = 6;
            this.windDirection = new BABYLON.Vector2(0, 1);
            this.waveHeight = 0.3;
            this.waterColor = new BABYLON.Color3(0.1, 0.1, 0.6);
            this.colorBlendFactor = 0.2;
            this.waveLength = 0.1;
            this._reflectionTransform = BABYLON.Matrix.Zero();
            this._lastTime = 0;
            this._mesh = sourceMesh;
            this._scene = scene;
            if (this._mesh === null) {
                this._mesh = WaterMaterial.CreateDefaultMesh(name + "_mesh", scene);
            }
            this._createMaterial(name, scene, renderTargetSize);
            this._mesh.material = this._material;
        }
        Object.defineProperty(WaterMaterial.prototype, "mesh", {
            get: function () {
                return this._mesh;
            },
            set: function (mesh) {
                this._mesh = mesh;
            },
            enumerable: true,
            configurable: true
        });
        WaterMaterial.prototype._createMaterial = function (name, scene, renderTargetSize) {
            var _this = this;
            // Render targets
            this._refractionRTT = new BABYLON.RenderTargetTexture(name + "_refraction", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
            this._reflectionRTT = new BABYLON.RenderTargetTexture(name + "_reflection", { width: renderTargetSize.x, height: renderTargetSize.y }, scene, false, true);
            scene.customRenderTargets.push(this._refractionRTT);
            scene.customRenderTargets.push(this._reflectionRTT);
            this._refractionRTT.renderList = scene.meshes;
            this._reflectionRTT.renderList = scene.meshes;
            var isVisible;
            var clipPlane = null;
            var savedViewMatrix;
            var mirrorMatrix = BABYLON.Matrix.Zero();
            this._refractionRTT.onBeforeRender = function () {
                isVisible = _this._mesh.isVisible;
                _this._mesh.isVisible = false;
                // Clip plane
                if (scene.clipPlane) {
                    clipPlane = scene.clipPlane.clone();
                }
                scene.clipPlane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, _this._mesh.position.y, 0), new BABYLON.Vector3(0, 1, 0));
            };
            this._refractionRTT.onAfterRender = function () {
                _this._mesh.isVisible = isVisible;
                // Clip plane
                scene.clipPlane = clipPlane;
            };
            this._reflectionRTT.onBeforeRender = function () {
                isVisible = _this._mesh.isVisible;
                _this._mesh.isVisible = false;
                // Clip plane
                if (scene.clipPlane) {
                    clipPlane = scene.clipPlane.clone();
                }
                scene.clipPlane = BABYLON.Plane.FromPositionAndNormal(new BABYLON.Vector3(0, _this._mesh.position.y, 0), new BABYLON.Vector3(0, -1, 0));
                // Transform
                BABYLON.Matrix.ReflectionToRef(scene.clipPlane, mirrorMatrix);
                savedViewMatrix = scene.getViewMatrix();
                mirrorMatrix.multiplyToRef(savedViewMatrix, _this._reflectionTransform);
                scene.setTransformMatrix(_this._reflectionTransform, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = false;
                scene._mirroredCameraPosition = BABYLON.Vector3.TransformCoordinates(scene.activeCamera.position, mirrorMatrix);
            };
            this._reflectionRTT.onAfterRender = function () {
                _this._mesh.isVisible = isVisible;
                // Clip plane
                scene.clipPlane = clipPlane;
                // Transform
                scene.setTransformMatrix(savedViewMatrix, scene.getProjectionMatrix());
                scene.getEngine().cullBackFaces = true;
                scene._mirroredCameraPosition = null;
            };
            // Material
            this._material = new BABYLON.ShaderMaterial(name + "_material", scene, "water", {
                attributes: ["position", "normal", "uv"],
                uniforms: [
                    "worldViewProjection", "worldReflectionViewProjection", "windDirection", "waveLength", "time", "windForce",
                    "cameraPosition", "waveHeight", "waterColor", "colorBlendFactor"
                ],
                samplers: ["bumpSampler", "refractionSampler", "reflectionSampler"]
            });
            this._material.onBind = this._bindMaterial();
        };
        WaterMaterial.prototype._bindMaterial = function () {
            var _this = this;
            return function (material, mesh) {
                var effect = _this._material.getEffect();
                effect.setTexture("bumpSampler", _this.bumpTexture);
                effect.setTexture("refractionSampler", _this._refractionRTT);
                effect.setTexture("reflectionSampler", _this._reflectionRTT);
                var wrvp = _this._mesh.getWorldMatrix().multiply(_this._reflectionTransform).multiply(_this._scene.getProjectionMatrix());
                _this._lastTime += _this._scene.getEngine().getDeltaTime();
                effect.setMatrix("worldReflectionViewProjection", wrvp);
                effect.setVector2("windDirection", _this.windDirection);
                effect.setFloat("waveLength", _this.waveLength);
                effect.setFloat("time", _this._lastTime / 100000);
                effect.setFloat("windForce", _this.windForce);
                effect.setVector3("cameraPosition", _this._scene.activeCamera.position);
                effect.setFloat("waveHeight", _this.waveHeight);
                effect.setColor4("waterColor", _this.waterColor, 1.0);
                effect.setFloat("colorBlendFactor", _this.colorBlendFactor);
            };
        };
        WaterMaterial.CreateDefaultMesh = function (name, scene) {
            var mesh = BABYLON.Mesh.CreateGround(name, 512, 512, 32, scene, false);
            return mesh;
        };
        return WaterMaterial;
    })();
    BABYLON.WaterMaterial = WaterMaterial;
})(BABYLON || (BABYLON = {}));
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
