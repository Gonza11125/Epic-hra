#pragma once
#include "CoreMinimal.h"
#include "GameFramework/Character.h"
#include "GameFramework/GameModeBase.h"
#include "GameFramework/SaveGame.h"
#include "GameFramework/HUD.h"
#include "NexusExplorer.generated.h"

class USpringArmComponent;
class UCameraComponent;
class UStaticMeshComponent;

UCLASS()
class NEXUS_API UNexusFieldSave : public USaveGame
{
    GENERATED_BODY()
  public:
    UPROPERTY(SaveGame) int32 Revision = 1;
    UPROPERTY(SaveGame) FName Region;
    UPROPERTY(SaveGame) FTransform Pose;
    UPROPERTY(SaveGame) FRotator Look;
    UPROPERTY(SaveGame) bool bFirstPerson = false;
    UPROPERTY(SaveGame) uint8 JournalStage = 0;
};

UCLASS()
class NEXUS_API ANexusExplorer : public ACharacter
{
    GENERATED_BODY()
  public:
    ANexusExplorer();
    FString JournalPrompt() const;
    virtual void Tick(float DeltaSeconds) override;
    virtual void BeginPlay() override;
    virtual void SetupPlayerInputComponent(UInputComponent *Input) override;

  private:
    UPROPERTY() TObjectPtr<USpringArmComponent> Boom;
    UPROPERTY() TObjectPtr<UCameraComponent> Camera;
    UPROPERTY() TObjectPtr<USceneComponent> Suit;
    UPROPERTY() TArray<TObjectPtr<USceneComponent>> Legs;
    UPROPERTY() TArray<TObjectPtr<USceneComponent>> Arms;
    bool bFirst = false;
    uint8 JournalStage = 0;
    float Phase = 0;
    void Forward(float V);
    void Right(float V);
    void Run();
    void Walk();
    void ToggleView();
    void ApplyView();
    void Store();
    void Restore();
    void ReadStation();
    void Notify(const FString &Message) const;
};

UCLASS()
class NEXUS_API ANexusFieldHUD : public AHUD
{
    GENERATED_BODY()
  public:
    virtual void DrawHUD() override;
};

UCLASS()
class NEXUS_API ANexusFieldMode : public AGameModeBase
{
    GENERATED_BODY()
  public:
    ANexusFieldMode();
};
