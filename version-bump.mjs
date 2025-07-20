import fs from "fs";
import path from "path";

function getPackageVersion() {
    const packageJson = JSON.parse(fs.readFileSync(path.resolve("package.json"), "utf8"));
    return packageJson.version;
}

function updateManifest(newVersion) {
    const manifestPath = path.resolve("manifest.json");
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    manifest.version = newVersion;
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, "\t"));
}

function updateVersions(newVersion) {
    const versionsPath = path.resolve("versions.json");
    const versions = JSON.parse(fs.readFileSync(versionsPath, "utf8"));
    versions[newVersion] = getPackageVersion();
    fs.writeFileSync(versionsPath, JSON.stringify(versions, null, "\t"));
}


const newVersion = getPackageVersion();
updateManifest(newVersion);
updateVersions(newVersion);

console.log(`Version bumped to ${newVersion}`); 