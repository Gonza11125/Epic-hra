"""Run from Unreal Editor with -ExecutePythonScript. All generated assets are native UE packages."""

import json
import math
import struct
from pathlib import Path
import unreal as ue

PROJECT = Path(ue.Paths.convert_relative_path_to_full(ue.Paths.project_dir()))
DATA = PROJECT / "Content" / "FieldData"
MAP = "/Game/Maps/Valley07"
READY = PROJECT / "Saved" / "NexusValley.ready"
actors = ue.get_editor_subsystem(ue.EditorActorSubsystem)
levels = ue.get_editor_subsystem(ue.LevelEditorSubsystem)
assets = ue.EditorAssetLibrary
edit = ue.MaterialEditingLibrary
PALETTE = {
    "Fabric": (0.035, 0.10, 0.14),
    "Shell": (0.69, 0.73, 0.69),
    "Trim": (0.055, 0.076, 0.082),
    "Lens": (0.018, 0.13, 0.15),
    "Signal": (0.15, 0.82, 0.69),
    "Ochre": (0.78, 0.31, 0.095),
    "Deck": (0.22, 0.255, 0.24),
    "Bed": (0.085, 0.20, 0.21),
    "Light": (1, 0.73, 0.41),
}


def make_material(name, color=None):
    folder = "/Game/FieldMaterials"
    asset_name = "M_" + name
    dest = folder + "/" + asset_name
    mat = assets.load_asset(dest) if assets.does_asset_exist(dest) else None
    if mat:
        return mat
    mat = ue.AssetToolsHelpers.get_asset_tools().create_asset(
        asset_name, folder, ue.Material, ue.MaterialFactoryNew()
    )
    if not mat:
        raise RuntimeError(dest)

    def node(kind, **props):
        item = edit.create_material_expression(mat, kind)
        for key, value in props.items():
            item.set_editor_property(key, value)
        return item

    def link(src, output, dest_node, pin):
        if not edit.connect_material_expressions(src, output, dest_node, pin):
            raise RuntimeError("Material connection " + name + " / " + pin)

    def output(src, channel, prop):
        if not edit.connect_material_property(src, channel, prop):
            raise RuntimeError("Material output " + name)

    prop = ue.MaterialProperty
    if color is None:
        base = node(ue.MaterialExpressionVertexColor)
        output(base, "", prop.MP_BASE_COLOR)
        mat.set_editor_property("two_sided", True)
    else:
        base = node(
            ue.MaterialExpressionConstant3Vector, constant=ue.LinearColor(*color, 1)
        )
        output(base, "", prop.MP_BASE_COLOR)
        if name in ("Signal", "Light"):
            output(base, "", prop.MP_EMISSIVE_COLOR)
    rough = (
        0.2
        if name in ("Lens", "Water")
        else 0.57 if name in ("Shell", "Trim") else 0.83
    )
    output(node(ue.MaterialExpressionConstant, r=rough), "", prop.MP_ROUGHNESS)
    if name == "Water":
        # Two wave trains rotate the tangent-space normal while keeping water height fixed.
        uv = node(ue.MaterialExpressionTextureCoordinate)
        pan = node(ue.MaterialExpressionPanner, speed_x=0.055, speed_y=-0.033)
        link(uv, "", pan, "Coordinate")
        vec = []
        for prop_key in ("r", "g"):
            mask = node(
                ue.MaterialExpressionComponentMask, r=prop_key == "r", g=prop_key == "g"
            )
            link(pan, "", mask, "")
            sine = node(ue.MaterialExpressionSine)
            link(mask, "", sine, "")
            scale = node(ue.MaterialExpressionMultiply, const_b=0.12)
            link(sine, "", scale, "A")
            vec.append(scale)
        xy = node(ue.MaterialExpressionAppendVector)
        link(vec[0], "", xy, "A")
        link(vec[1], "", xy, "B")
        normal = node(ue.MaterialExpressionAppendVector)
        link(xy, "", normal, "A")
        link(node(ue.MaterialExpressionConstant, r=1.0), "", normal, "B")
        output(normal, "", prop.MP_NORMAL)
    edit.recompile_material(mat)
    if not assets.save_loaded_asset(mat):
        raise RuntimeError("Saving " + dest)
    return mat


def spawn(cls, label, pos, rot=None):
    ob = actors.spawn_actor_from_class(cls, ue.Vector(*pos), rot or ue.Rotator())
    if not ob:
        raise RuntimeError(label)
    ob.set_actor_label(label)
    return ob


def populate():
    if assets.does_asset_exist(MAP):
        raise RuntimeError(
            "Mapa Valley07 již existuje. Otevři ji v editoru. Generátor chrání její úpravy."
        )
    scene = json.loads((DATA / "Scene.json").read_text(encoding="utf8"))
    grid = (DATA / "Ground.bin").read_bytes()

    def height(e, n):
        x = (e + 1250) / 10
        y = (n + 1750) / 10
        i = math.floor(x)
        j = math.floor(y)
        u = x - i
        v = y - j

        def z(a, b):
            return struct.unpack_from("<h", grid, 4 * (b * 251 + a))[0] * 10

        if u + v <= 1:
            return z(i, j) * (1 - u - v) + z(i + 1, j) * u + z(i, j + 1) * v
        return (
            z(i + 1, j + 1) * (u + v - 1)
            + z(i, j + 1) * (1 - u)
            + z(i + 1, j) * (1 - v)
        )

    mats = {key: make_material(key, val) for key, val in PALETTE.items()}
    make_material("Field")
    make_material("Water")
    scratch = "/Game/NexusBuild/WorkingValley"
    if assets.does_asset_exist(scratch):
        if not levels.load_level(scratch):
            raise RuntimeError(scratch)
        # This is the dedicated staging map left by a previously interrupted build.
        for ob in actors.get_all_level_actors():
            if "NexusGenerated" in [str(t) for t in ob.get_editor_property("tags")]:
                actors.destroy_actor(ob)
    elif not levels.new_level(scratch):
        raise RuntimeError("Cannot create a level")
    field = spawn(ue.NexusValley, "Elyra / Údolí 07", (0, 0, 0))
    field.set_editor_property("tags", ["NexusGenerated"])
    for species in scene["shapes"]:
        if not field.build_species(species) or not assets.save_asset(
            "/Game/Flora/SM_" + species, False
        ):
            raise RuntimeError("Flora: " + species)
    if not field.bake_field():
        raise RuntimeError("Terrain bake failed")
    cube = assets.load_asset("/Engine/BasicShapes/Cube")
    cyl = assets.load_asset("/Engine/BasicShapes/Cylinder")
    sphere = assets.load_asset("/Engine/BasicShapes/Sphere")

    def piece(label, pos, dims, paint="Shell", mesh=None, yaw=0, pitch=0):
        ob = spawn(ue.StaticMeshActor, label, pos, ue.Rotator(pitch=pitch, yaw=yaw))
        comp = ob.static_mesh_component
        comp.set_static_mesh(mesh or cube)
        comp.set_material(0, mats[paint])
        ob.set_actor_scale3d(ue.Vector(*(s / 100 for s in dims)))
        ob.set_folder_path("Habitat 07" if pos[0] > -3000 else "Hydrology")
        return ob

    # All habitat dimensions are centimetres. Front opening is on the south side.
    floor = height(12, 12)

    def hab(label, x, y, z, dx, dy, dz, paint="Shell", **kw):
        return piece(label, (1200 + x, 1200 + y, floor + z), (dx, dy, dz), paint, **kw)

    hab("01 / Walkable deck", 0, 0, 5, 1040, 1220, 18, "Deck")
    for y in (-597, 597):
        hab("Side wall sill", 0, y, 60, 990, 24, 110)
        hab("Side wall header", 0, y, 295, 990, 26, 54)
        for x in (-480, -160, 160, 480):
            hab("Window pier", x, y, 177, 36, 32, 250, "Trim")
        hab("Facade amber band", 0, y * 1.021, 87, 995, 8, 12, "Ochre")
    hab("North wall", 495, 0, 166, 30, 1200, 320)
    for y in (-398, 398):
        hab("Entrance wing", -495, y, 162, 30, 402, 316)
    hab("Entrance lintel", -495, 0, 289, 32, 400, 62, "Trim")
    hab("Floating roof", 0, 0, 335, 1110, 1320, 47)
    hab("Roof edge", 0, 0, 362, 1060, 1260, 12, "Trim")
    hab("Porch canopy", -606, 0, 280, 224, 610, 24)
    for y in (-287, 287):
        hab("Canopy strut", -690, y, 130, 17, 17, 264, "Trim", mesh=cyl)
    hab("Cabin berth", 285, -388, 35, 260, 112, 62, "Trim")
    hab("Berth cushion", 285, -388, 75, 255, 110, 20, "Bed")
    hab("Pillow", 375, -388, 90, 60, 89, 16)
    hab("Desk", 310, 305, 99, 124, 245, 13, "Deck")
    for y in (216, 395):
        hab("Desk leg", 315, y, 51, 21, 21, 91, "Trim")
    hab("Data terminal", 343, 303, 142, 13, 141, 82, "Trim")
    hab("Terminal display", 335, 303, 143, 2, 124, 59, "Signal")
    hab("Cabin light", 20, 0, 307, 230, 12, 8, "Light")

    def text_actor(label, words, pos, yaw, size):
        ob = spawn(ue.TextRenderActor, label, pos, ue.Rotator(yaw=yaw))
        text = ob.get_component_by_class(ue.TextRenderComponent)
        text.set_text(words)
        text.set_world_size(size)
        ob.set_folder_path("Wayfinding")

    text_actor(
        "Habitat number", "N E X U S   /   0 7", (688, 1780, floor + 205), 180, 31
    )
    text_actor(
        "Cabin terminal key", "[ E ]   DENIK", (1517, 1580, floor + 181), 180, 12
    )
    point = spawn(ue.PointLight, "Reading light", (1210, 1200, floor + 254))
    lamp = point.get_component_by_class(ue.PointLightComponent)
    lamp.set_editor_property("intensity", 1200)
    lamp.set_editor_property("attenuation_radius", 760)
    for e, n in [(35, -22), (68, -55), (101, -93), (127, -132), (151, -178)]:
        z = height(e, n)
        piece("Survey marker", (n * 100, e * 100, z + 70), (25, 25, 140), "Trim", cyl)
        piece("Beacon ring", (n * 100, e * 100, z + 140), (31, 31, 13), "Signal", cyl)
    e, n = 151, -178
    h = height(e, n)
    piece("HYDRO / 07", (n * 100, e * 100, h + 88), (58, 72, 125), "Shell")
    piece("Probe screen", (n * 100 + 30, e * 100, h + 103), (5, 58, 52), "Lens")
    text_actor(
        "Probe prompt", "[ E ]   HYDRO 07", (n * 100 + 35, e * 100 - 26, h + 132), 0, 10
    )
    spawn(
        ue.PlayerStart,
        "Plošina osady",
        (-1250, 400, height(4, -12.5) + 110),
        ue.Rotator(yaw=19),
    )
    sun = spawn(
        ue.DirectionalLight,
        "Elyra / low sun",
        (0, 0, 17000),
        ue.Rotator(pitch=-27, yaw=-40),
    )
    sun_comp = sun.get_component_by_class(ue.DirectionalLightComponent)
    sun_comp.set_mobility(ue.ComponentMobility.MOVABLE)
    sun_comp.set_editor_property("intensity", 5.5)
    sun_comp.set_editor_property("atmosphere_sun_light", True)
    spawn(ue.SkyAtmosphere, "Atmosphere", (0, 0, 0))
    sky = spawn(ue.SkyLight, "Sky illumination", (0, 0, 2500)).get_component_by_class(
        ue.SkyLightComponent
    )
    sky.set_mobility(ue.ComponentMobility.MOVABLE)
    sky.set_editor_property("real_time_capture", True)
    fog = spawn(ue.ExponentialHeightFog, "Valley haze", (0, 0, 1000))
    fog.get_component_by_class(ue.ExponentialHeightFogComponent).set_editor_property(
        "fog_density", 0.013
    )
    editor = ue.get_editor_subsystem(ue.UnrealEditorSubsystem)
    editor.set_level_viewport_camera_info(
        ue.Vector(-2850, -1360, floor + 530), ue.Rotator(pitch=-5, yaw=33)
    )
    if not field.check_walkable_scene():
        raise RuntimeError("Scene validation: floor, lake bed or cabin entrance")
    if not ue.EditorLoadingAndSavingUtils.save_map(editor.get_editor_world(), MAP):
        raise RuntimeError("Saving Valley07 failed")
    READY.parent.mkdir(parents=True, exist_ok=True)
    READY.write_text(
        json.dumps(
            {
                "map": MAP,
                "engine": ue.SystemLibrary.get_engine_version(),
                "species": len(scene["shapes"]),
            }
        ),
        encoding="utf8",
    )
    ue.log("NEXUS: Valley07 saved.")


populate()
