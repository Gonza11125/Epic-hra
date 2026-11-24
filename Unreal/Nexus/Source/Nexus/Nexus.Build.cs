using UnrealBuildTool;

public class Nexus : ModuleRules
{
    public Nexus(ReadOnlyTargetRules Target) : base(Target)
    {
        PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;
        PublicDependencyModuleNames.AddRange(new[] {
            "Core", "CoreUObject", "Engine", "InputCore", "PhysicsCore", "ProceduralMeshComponent", "Json"
        });
        if (Target.bBuildEditor) {
            PrivateDependencyModuleNames.AddRange(new[] { "MeshDescription", "StaticMeshDescription", "AssetRegistry" });
        }
    }
}
