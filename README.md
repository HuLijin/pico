# Pico

## Shortcuts for variables and switches

### Global access

- `V(ID)` : get the value the variables `ID`
- `V(ID, new_value)` : set the value of the variable `ID`
- `S(ID)` : get the value of the switch `ID`
- `S(ID, new_value)` : set the value of the switch `ID`
- `SV(MAP_ID, EVENT_ID, ID)` : get the self-variable `ID` of the `EVENT_ID` in the map `MAP_ID`
- `SV(MAP_ID, EVENT_ID, ID, VALUE)` : set the value of the self-variables `ID` of the `EVENT_ID` in the map `MAP_ID`
- `SS(MAP_ID, EVENT_ID, ID)` : get the self-switch `ID` of the `EVENT_ID` in the map `MAP_ID`
- `SS(MAP_ID, EVENT_ID, ID, VALUE)` : set the value of the self-switch `ID` of the `EVENT_ID` in the map `MAP_ID`

### Local access

- `this.S(ID)` : get the value of the self-switch `ID` of the current event
- `this.S(ID, VALUE)` : set the value of the self-switch `ID` of the current event
- `this.V(ID)` : get the value of the self-variable `ID` of the current event
- `this.V(ID, VALUE)` : set the value of the self-variable `ID` of the current event
