// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use jlctl::{device_manager::{DeviceManager, Status}, types::{Net, SupplySwitchPos, ChipStatus}};
use std::sync::{Arc, Mutex};

fn main() {
    let mut device_manager = DeviceManager::new(None);
    // log elsewhere than in the source tree
    device_manager.set_log_path("/tmp/jumperlab.log".to_string());
    let device_manager = Arc::new(Mutex::new(device_manager));
    tauri::Builder::default()
        .manage(device_manager)
        .invoke_handler(tauri::generate_handler![
            jlctl_status,
            jlctl_netlist,
            jlctl_set_netlist,
            jlctl_supply_switch_pos,
            jlctl_set_supply_switch_pos,
            jlctl_chip_status,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn jlctl_status(state: tauri::State<Arc<Mutex<DeviceManager>>>) -> Result<Status, String> {
    state.lock().unwrap().status().map_err(|e| e.to_string())
}

#[tauri::command]
fn jlctl_netlist(state: tauri::State<Arc<Mutex<DeviceManager>>>) -> Result<Vec<Net>, String> {
    state.lock().unwrap().with_device(|device| device.netlist()).map_err(|e| e.to_string())
}

#[tauri::command]
fn jlctl_set_netlist(state: tauri::State<Arc<Mutex<DeviceManager>>>, netlist: Vec<Net>) -> Result<(), String> {
    state.lock().unwrap().with_device(|device| device.set_netlist(netlist)).map_err(|e| e.to_string())
}

#[tauri::command]
fn jlctl_supply_switch_pos(state: tauri::State<Arc<Mutex<DeviceManager>>>) -> Result<String, String> {
    state.lock().unwrap().with_device(|device| device.supply_switch())
        .map(|pos| pos.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
fn jlctl_set_supply_switch_pos(state: tauri::State<Arc<Mutex<DeviceManager>>>, pos: String) -> Result<(), String> {
    let pos: SupplySwitchPos = pos.parse().map_err(|_| "Invalid pos value")?;
    state.lock().unwrap().with_device(|device| device.set_supply_switch(pos)).map_err(|e| e.to_string())
}

#[tauri::command]
fn jlctl_chip_status(state: tauri::State<Arc<Mutex<DeviceManager>>>) -> Result<Vec<ChipStatus>, String> {
    state.lock().unwrap().with_device(|device| device.chipstatus()).map_err(|e| e.to_string())
}
