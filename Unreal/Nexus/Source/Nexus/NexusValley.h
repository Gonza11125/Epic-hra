#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Actor.h"
#include "NexusValley.generated.h"

class UProceduralMeshComponent;
class UStaticMesh;
class UHierarchicalInstancedStaticMeshComponent;
class UMaterialInterface;
class USceneComponent;

UCLASS()
class NEXUS_API ANexusValley : public AActor
{
    GENERATED_BODY()
  public:
    ANexusValley();
    // The editor bakes the terrain into the level so its collision exists before possession.
    UFUNCTION(BlueprintCallable, Category = "Valley")
    bool BakeField();

    UPROPERTY(VisibleAnywhere) TObjectPtr<UProceduralMeshComponent> Ground;
    UFUNCTION(BlueprintCallable, Category = "Valley")
    bool CheckWalkableScene() const;

    UFUNCTION(BlueprintCallable, Category = "Valley")
    bool BuildSpecies(const FString &Species);

    UPROPERTY(VisibleAnywhere) TArray<TObjectPtr<UHierarchicalInstancedStaticMeshComponent>> Groves;
    UPROPERTY(VisibleAnywhere) TObjectPtr<UProceduralMeshComponent> Water;
};
