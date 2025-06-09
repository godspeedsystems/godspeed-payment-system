"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
try {
    if (process.env.OTEL_ENABLED == 'true') {
        require('@godspeedsystems/tracing').initialize();
    }
}
catch (error) {
    console.error("OTEL_ENABLED is set, unable to initialize opentelemetry tracing.");
    console.error(error);
    process.exit(1);
}
const core_1 = __importDefault(require("@godspeedsystems/core"));
// create a godspeed
// const gsApp = new Godspeed();
// // initilize the Godspeed App
// // this is responsible to load all kind of entities
// gsApp.initialize();
// export default gsApp;
function bootstrap() {
    return __awaiter(this, void 0, void 0, function* () {
        const gsApp = new core_1.default();
        yield gsApp.initialize();
        return gsApp;
    });
}
// ✅ Export a Promise (resolves to initialized app)
const appPromise = bootstrap();
exports.default = appPromise;
//# sourceMappingURL=index.js.map