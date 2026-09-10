import JSZip from 'jszip';

export interface AndroidProjectConfig {
  appName: string;
  appShortName: string;
  packageId: string;
  appUrl: string;
  themeColor: string;
  backgroundColor: string;
}

export async function generateAndroidProjectZip(
  config: AndroidProjectConfig
): Promise<Blob> {
  const zip = new JSZip();

  const {
    appName,
    packageId,
    appUrl,
    themeColor,
  } = config;

  // Root build.gradle
  zip.file(
    'build.gradle',
    `// Top-level build file where you can add configuration options common to all sub-projects/modules.
buildscript {
    repositories {
        google()
        mavenCentral()
    }
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.2'
        classpath 'org.jetbrains.kotlin:kotlin-gradle-plugin:1.9.22'
    }
}

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

tasks.register('clean', Delete) {
    delete rootProject.buildDir
}
`
  );

  // settings.gradle
  zip.file(
    'settings.gradle',
    `pluginManagement {
    repositories {
        google()
        mavenCentral()
        gradlePluginPortal()
    }
}
dependencyResolutionManagement {
    repositoriesMode.set(RepositoriesMode.FAIL_ON_PROJECT_REPOS)
    repositories {
        google()
        mavenCentral()
    }
}

rootProject.name = "${appName.replace(/[^a-zA-Z0-9_-]/g, '')}"
include ':app'
`
  );

  // gradle.properties
  zip.file(
    'gradle.properties',
    `org.gradle.jvmargs=-Xmx2048m -Dfile.encoding=UTF-8
android.useAndroidX=true
android.nonTransitiveRClass=true
kotlin.code.style=official
`
  );

  // twa-manifest.json for Google Bubblewrap CLI
  const twaManifest = {
    packageId: packageId,
    host: new URL(appUrl).host,
    name: appName,
    launcherName: config.appShortName,
    themeColor: themeColor,
    navigationColor: themeColor,
    backgroundColor: config.backgroundColor,
    startUrl: '/',
    iconUrl: `${appUrl}/pwa-512x512.png`,
    maskableIconUrl: `${appUrl}/pwa-maskable-512x512.png`,
    appVersionName: '1.0.0',
    appVersionCode: 1,
    shortcuts: [],
    generatorApp: 'bubblewrap',
    webManifestUrl: `${appUrl}/manifest.webmanifest`,
    fallbackType: 'customtabs',
    enableNotifications: true,
  };
  zip.file('twa-manifest.json', JSON.stringify(twaManifest, null, 2));

  // app/build.gradle
  zip.file(
    'app/build.gradle',
    `plugins {
    id 'com.android.application'
    id 'org.jetbrains.kotlin.android'
}

android {
    namespace '${packageId}'
    compileSdk 34

    defaultConfig {
        applicationId "${packageId}"
        minSdk 21
        targetSdk 34
        versionCode 1
        versionName "1.0.0"

        manifestPlaceholders = [
            hostName: "${new URL(appUrl).host}",
            defaultUrl: "${appUrl}",
            launcherName: "${config.appShortName}",
            themeColor: "${themeColor}"
        ]

        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }

    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
        debug {
            applicationIdSuffix ".debug"
            debuggable true
        }
    }
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = '17'
    }
}

dependencies {
    implementation 'androidx.core:core-ktx:1.12.0'
    implementation 'androidx.appcompat:appcompat:1.6.1'
    implementation 'com.google.android.material:material:1.11.0'
    // Google Android Browser Helper (Official Trusted Web Activity library)
    implementation 'com.google.androidbrowserhelper:androidbrowserhelper:2.5.0'
}
`
  );

  // app/src/main/AndroidManifest.xml
  zip.file(
    'app/src/main/AndroidManifest.xml',
    `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher"
        android:supportsRtl="true"
        android:theme="@style/Theme.MahaSchool">

        <activity
            android:name="com.google.androidbrowserhelper.trusted.LauncherActivity"
            android:label="@string/app_name"
            android:exported="true">

            <meta-data
                android:name="android.support.customtabs.trusted.DEFAULT_URL"
                android:value="${appUrl}" />

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

            <intent-filter android:autoVerify="true">
                <action android:name="android.intent.action.VIEW" />
                <category android:name="android.intent.category.DEFAULT" />
                <category android:name="android.intent.category.BROWSABLE" />
                <data
                    android:scheme="https"
                    android:host="${new URL(appUrl).host}" />
            </intent-filter>
        </activity>
    </application>

</manifest>
`
  );

  // app/src/main/res/values/strings.xml
  zip.file(
    'app/src/main/res/values/strings.xml',
    `<resources>
    <string name="app_name">${appName}</string>
    <string name="school_tagline">Maharashtra School Attendance &amp; Poshan Aahar</string>
</resources>
`
  );

  // app/src/main/res/values/colors.xml
  zip.file(
    'app/src/main/res/values/colors.xml',
    `<resources>
    <color name="primary">${themeColor}</color>
    <color name="primary_dark">#042F2E</color>
    <color name="accent">#F59E0B</color>
</resources>
`
  );

  // app/src/main/res/values/themes.xml
  zip.file(
    'app/src/main/res/values/themes.xml',
    `<resources>
    <style name="Theme.MahaSchool" parent="Theme.MaterialComponents.DayNight.NoActionBar">
        <item name="colorPrimary">${themeColor}</item>
        <item name="colorPrimaryVariant">#042F2E</item>
        <item name="colorOnPrimary">#FFFFFF</item>
        <item name="android:statusBarColor">${themeColor}</item>
        <item name="android:navigationBarColor">${themeColor}</item>
    </style>
</resources>
`
  );

  // README_BUILD_APK.md
  zip.file(
    'README_BUILD_APK.md',
    `# MahaSchool - Android APK Build Instructions
(महाराष्ट्र शाळा हजेरी व पोषण आहार - Android APK निर्मिती)

This Android project wraps the MahaSchool Progressive Web Application into a native Android APK using Google's official **Trusted Web Activity (TWA)** / Android Browser Helper architecture.

---

## 🚀 3 Simple Ways to Get the APK

### 1. Easiest: Direct WebAPK on Android (No Compilation Needed)
1. Open this link in Google Chrome on your Android phone:
   \`${appUrl}\`
2. Tap the banner **"Install / ॲप इन्स्टॉल करा"** or Chrome menu (⋮) -> **"Install app"**.
3. Android OS automatically generates and installs the native **WebAPK** onto your phone, registered in Android Settings > Apps with its own standalone icon!

---

### 2. Fastest 1-Click APK Generator (PWABuilder / Bubblewrap)
Google Chrome & Microsoft provide **PWABuilder** which builds signed APKs in the cloud:
1. Visit: https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}
2. Click **"Package for Stores"** -> **Android**.
3. Click **"Download APK"** to get the installable \`.apk\` file immediately.

---

### 3. Build with Android Studio (This Project)
1. Open **Android Studio** (Hedgehog or newer).
2. Choose **Open** -> Select this unzipped folder.
3. Let Gradle sync dependencies.
4. In the top menu, click **Build** -> **Build Bundle(s) / APK(s)** -> **Build APK(s)**.
5. The generated file will be at:
   \`app/build/outputs/apk/debug/app-debug.apk\`
6. Transfer \`app-debug.apk\` to any Android smartphone via WhatsApp, Cable, or Google Drive and tap to install!
`
  );

  return await zip.generateAsync({ type: 'blob' });
}
