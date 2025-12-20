#!/usr/bin/gjs

import Adw from "gi://Adw?version=1";
import Gtk from "gi://Gtk?version=4.0";
import Gdk from "gi://Gdk?version=4.0";
import GLib from "gi://GLib";
import { WifiMenuApplication } from "./app/Application.js";

Adw.init();

// --- CSS global ---
const css = new Gtk.CssProvider();

const scriptDir = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]);
const cssPath = GLib.build_filenamev([scriptDir, "..", "src", "style", "main.css"]);

if (!GLib.file_test(cssPath, GLib.FileTest.EXISTS)) {
    console.error(`CSS introuvable: ${cssPath}`);
} else {
    css.load_from_path(cssPath);
    Gtk.StyleContext.add_provider_for_display(
        Gdk.Display.get_default(),
        css,
        Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION
    );
}

// libadwaita theme
const styleManager = Adw.StyleManager.get_default();
styleManager.set_color_scheme(Adw.ColorScheme.DEFAULT);

const app = new WifiMenuApplication();
app.run([]);