#include "NexusExplorer.h"
#include "Camera/CameraComponent.h"
#include "Components/CapsuleComponent.h"
#include "Components/InputComponent.h"
#include "Components/StaticMeshComponent.h"
#include "Engine/Engine.h"
#include "Engine/Canvas.h"
#include "Engine/StaticMesh.h"
#include "Materials/MaterialInterface.h"
#include "GameFramework/CharacterMovementComponent.h"
#include "GameFramework/PlayerController.h"
#include "GameFramework/SpringArmComponent.h"
#include "Kismet/GameplayStatics.h"
#include "UObject/ConstructorHelpers.h"

namespace
{
const FString Slot = TEXT("Nexus_Valley07_v1");
const FName Region = TEXT("elyra.valley-07");
const FVector ShoreBeacon(-17800, 15100, 0);
const FVector HabitatDesk(1510, 1500, 1905);
} // namespace

ANexusFieldMode::ANexusFieldMode()
{
    DefaultPawnClass = ANexusExplorer::StaticClass();
    HUDClass = ANexusFieldHUD::StaticClass();
}

ANexusExplorer::ANexusExplorer()
{
    PrimaryActorTick.bCanEverTick = true;
    GetCapsuleComponent()->InitCapsuleSize(36, 91);
    bUseControllerRotationYaw = false;
    auto *M = GetCharacterMovement();
    M->bOrientRotationToMovement = true;
    M->RotationRate = FRotator(0, 500, 0);
    M->MaxWalkSpeed = 180;
    M->JumpZVelocity = 440;
    M->GravityScale = .96f;
    M->AirControl = .32f;
    M->MaxStepHeight = 42;
    Boom = CreateDefaultSubobject<USpringArmComponent>(TEXT("Orbit"));
    Boom->SetupAttachment(RootComponent);
    Boom->SetRelativeLocation(FVector(0, 0, 57));
    Boom->bUsePawnControlRotation = true;
    Boom->ProbeSize = 12;
    Boom->bDoCollisionTest = true;
    Camera = CreateDefaultSubobject<UCameraComponent>(TEXT("Camera"));
    Camera->SetupAttachment(Boom, USpringArmComponent::SocketName);
    Suit = CreateDefaultSubobject<USceneComponent>(TEXT("ExpeditionSuit"));
    Suit->SetupAttachment(RootComponent);
    Suit->SetRelativeLocation(FVector(0, 0, -91));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Ball(TEXT("/Engine/BasicShapes/Sphere.Sphere"));
    static ConstructorHelpers::FObjectFinder<UStaticMesh> Cube(TEXT("/Engine/BasicShapes/Cube.Cube"));
    auto Part = [&](const FString &Name, USceneComponent *Parent, FVector Location, FVector Size,
                    const FName &Paint, bool bBox = false)
    {
        auto *P = CreateDefaultSubobject<UStaticMeshComponent>(FName(*Name));
        P->SetupAttachment(Parent);
        P->SetStaticMesh(bBox ? Cube.Object : Ball.Object);
        P->SetRelativeLocation(Location);
        P->SetRelativeScale3D(Size / 100);
        P->SetCollisionEnabled(ECollisionEnabled::NoCollision);
        P->ComponentTags.Add(Paint);
    };
    Part(TEXT("Torso"), Suit, {0, 0, 120}, {39, 52, 67}, TEXT("Fabric"));
    Part(TEXT("ChestPlate"), Suit, {11, 0, 128}, {23, 46, 45}, TEXT("Shell"));
    Part(TEXT("Belt"), Suit, {0, 0, 101}, {34, 43, 10}, TEXT("Trim"), true);
    Part(TEXT("Helmet"), Suit, {0, 0, 161}, {32, 33, 38}, TEXT("Shell"));
    Part(TEXT("Visor"), Suit, {11, 0, 162}, {17, 29, 22}, TEXT("Lens"));
    Part(TEXT("Pack"), Suit, {-20, 0, 123}, {17, 35, 42}, TEXT("Shell"), true);
    Part(TEXT("PackLight"), Suit, {-29, 0, 125}, {2, 7, 24}, TEXT("Signal"), true);
    for (int Side = 0; Side < 2; Side++)
    {
        const float Sign = Side ? 1.f : -1.f;
        const FString Suffix = FString::FromInt(Side);
        auto Pivot = [&](FString Name, FVector Location)
        {
            auto *P = CreateDefaultSubobject<USceneComponent>(FName(*(Name + Suffix)));
            P->SetupAttachment(Suit);
            P->SetRelativeLocation(Location);
            return P;
        };
        auto *Leg = Pivot(TEXT("Hip"), {0, Sign * 12, 90});
        Legs.Add(Leg);
        Part(TEXT("Thigh") + Suffix, Leg, {0, 0, -21}, {21, 22, 45}, TEXT("Fabric"));
        Part(TEXT("Shin") + Suffix, Leg, {0, 0, -59}, {17, 19, 39}, TEXT("Shell"));
        Part(TEXT("Boot") + Suffix, Leg, {5, 0, -81}, {32, 20, 18}, TEXT("Trim"));
        auto *Arm = Pivot(TEXT("Shoulder"), {0, Sign * 27, 139});
        Arms.Add(Arm);
        Part(TEXT("ShoulderPlate") + Suffix, Arm, {0, 0, -3}, {23, 23, 23}, TEXT("Shell"));
        Part(TEXT("Sleeve") + Suffix, Arm, {0, Sign * 2, -20}, {15, 16, 30}, TEXT("Fabric"));
        Part(TEXT("Gauntlet") + Suffix, Arm, {3, Sign * 2, -43}, {15, 16, 27}, TEXT("Shell"));
        Part(TEXT("Glove") + Suffix, Arm, {5, Sign * 2, -58}, {13, 14, 16}, TEXT("Trim"));
    }
    ApplyView();
}
void ANexusExplorer::BeginPlay()
{
    Super::BeginPlay();
    TInlineComponentArray<UStaticMeshComponent *> Parts(this);
    for (auto *P : Parts)
        if (P->ComponentTags.Num())
        {
            const FString Name = TEXT("M_") + P->ComponentTags[0].ToString();
            if (auto *Mat = LoadObject<UMaterialInterface>(
                    nullptr, *(TEXT("/Game/FieldMaterials/") + Name + TEXT(".") + Name)))
                P->SetMaterial(0, Mat);
        }
    Notify(TEXT("Údolí 07   •   WASD pohyb   •   Shift běh   •   V kamera   •   F5 / F9 uložit a načíst"));
}
void ANexusExplorer::Tick(float Dt)
{
    Super::Tick(Dt);
    const float Speed = GetVelocity().Size2D();
    const float A = GetCharacterMovement()->IsMovingOnGround() ? FMath::Min(1.f, Speed / 170.f) : 0.f;
    Phase = FMath::Fmod(Phase + Dt * Speed * .044f, 2.f * PI);
    for (int32 I = 0; I < Legs.Num(); I++)
    {
        const float Swing = FMath::Sin(Phase) * (I ? 1 : -1) * A;
        Legs[I]->SetRelativeRotation(FRotator(23 * Swing, 0, 0));
        Arms[I]->SetRelativeRotation(FRotator(-20 * Swing, 0, 0));
    }
}
void ANexusExplorer::SetupPlayerInputComponent(UInputComponent *I)
{
    Super::SetupPlayerInputComponent(I);
    I->BindAxis("Forward", this, &ANexusExplorer::Forward);
    I->BindAxis("Right", this, &ANexusExplorer::Right);
    I->BindAxis("Turn", this, &APawn::AddControllerYawInput);
    I->BindAxis("Look", this, &APawn::AddControllerPitchInput);
    I->BindAction("Jump", IE_Pressed, this, &ACharacter::Jump);
    I->BindAction("Jump", IE_Released, this, &ACharacter::StopJumping);
    I->BindAction("Sprint", IE_Pressed, this, &ANexusExplorer::Run);
    I->BindAction("Sprint", IE_Released, this, &ANexusExplorer::Walk);
    I->BindAction("View", IE_Pressed, this, &ANexusExplorer::ToggleView);
    I->BindAction("Save", IE_Pressed, this, &ANexusExplorer::Store);
    I->BindAction("Load", IE_Pressed, this, &ANexusExplorer::Restore);
    I->BindAction("Read", IE_Pressed, this, &ANexusExplorer::ReadStation);
}
void ANexusExplorer::Forward(float V)
{
    if (Controller)
        AddMovementInput(FRotator(0, Controller->GetControlRotation().Yaw, 0).Vector(), V);
}
void ANexusExplorer::Right(float V)
{
    if (Controller)
        AddMovementInput(FRotator(0, Controller->GetControlRotation().Yaw + 90, 0).Vector(), V);
}
void ANexusExplorer::Run()
{
    GetCharacterMovement()->MaxWalkSpeed = 520;
}
void ANexusExplorer::Walk()
{
    GetCharacterMovement()->MaxWalkSpeed = 180;
}
void ANexusExplorer::ToggleView()
{
    bFirst = !bFirst;
    ApplyView();
}
void ANexusExplorer::ApplyView()
{
    Boom->TargetArmLength = bFirst ? 0 : 370;
    Boom->SocketOffset = bFirst ? FVector::ZeroVector : FVector(0, 32, 22);
    Suit->SetVisibility(!bFirst, true);
}
void ANexusExplorer::Store()
{
    if (!Controller || !GetCharacterMovement()->IsMovingOnGround())
    {
        Notify(TEXT("Uložení je možné po došlápnutí."));
        return;
    }
    auto *Save = Cast<UNexusFieldSave>(UGameplayStatics::CreateSaveGameObject(UNexusFieldSave::StaticClass()));
    if (!Save)
        return;
    Save->Region = Region;
    Save->Pose = GetActorTransform();
    Save->Look = Controller->GetControlRotation();
    Save->bFirstPerson = bFirst;
    Save->JournalStage = JournalStage;
    Notify(UGameplayStatics::SaveGameToSlot(Save, Slot, 0) ? TEXT("Pozice v Údolí 07 uložena.")
                                                           : TEXT("Uložení se nezdařilo."));
}
void ANexusExplorer::Restore()
{
    auto *S = Cast<UNexusFieldSave>(UGameplayStatics::LoadGameFromSlot(Slot, 0));
    if (!Controller || !S || S->Revision != 1 || S->Region != Region || S->Pose.ContainsNaN() ||
        S->Look.ContainsNaN())
    {
        Notify(TEXT("Pro Údolí 07 chybí platná uložená pozice."));
        return;
    }
    const FVector P = S->Pose.GetLocation();
    if (FMath::Abs(P.X) > 175000 || FMath::Abs(P.Y) > 125000 || !TeleportTo(P, S->Pose.Rotator()))
    {
        Notify(TEXT("Uložená pozice není přístupná."));
        return;
    }
    GetCharacterMovement()->StopMovementImmediately();
    Controller->SetControlRotation(S->Look);
    bFirst = S->bFirstPerson;
    JournalStage = FMath::Min<uint8>(S->JournalStage, 3);
    ApplyView();
    Notify(TEXT("Pozice obnovena."));
}
void ANexusExplorer::ReadStation()
{
    if (FVector::Dist2D(GetActorLocation(), ShoreBeacon) < 400)
    {
        JournalStage = FMath::Max<uint8>(JournalStage, 2);
        Notify(TEXT("HYDRO 07   •   Pobřežní sonda načtena."));
        return;
    }
    if (FVector::Dist(GetActorLocation(), HabitatDesk) < 240)
    {
        JournalStage = JournalStage >= 2 ? 3 : 1;
        Notify(JournalStage == 3 ? TEXT("Záznam o vodě předán. Průzkum dokončen.")
                                 : TEXT("Terénní deník   •   Sonda je na jihovýchodě. Sleduj světelné sloupky."));
    }
}
FString ANexusExplorer::JournalPrompt() const
{
    const FVector P = GetActorLocation();
    if (FVector::Dist(P, HabitatDesk) < 240)
        return TEXT("[E]  Terénní deník");
    if (FVector::Dist2D(P, ShoreBeacon) < 400)
        return TEXT("[E]  Načíst pobřežní sondu");
    if (JournalStage == 3)
        return TEXT("Průzkum vody dokončen   /   volný pohyb");
    const bool bToWater = JournalStage == 1;
    const int32 Meters = FMath::RoundToInt(FVector::Dist2D(P, bToWater ? ShoreBeacon : HabitatDesk) / 100.);
    return FString::Printf(TEXT("%s   •   %d m"),
                           bToWater            ? TEXT("Pobřežní sonda")
                           : JournalStage == 2 ? TEXT("Předej záznam v modulu")
                                               : TEXT("Obytný modul / terénní deník"),
                           Meters);
}
void ANexusFieldHUD::DrawHUD()
{
    Super::DrawHUD();
    const auto *PC = GetOwningPlayerController();
    const auto *Player = PC ? Cast<ANexusExplorer>(PC->GetPawn()) : nullptr;
    if (!Player || !Canvas)
        return;
    const float Y = Canvas->ClipY - 90.f;
    DrawRect(FLinearColor(.016f, .034f, .042f, .84f), 24, Y, 365, 65);
    DrawRect(FLinearColor(.29f, .76f, .67f, 1.f), 24, Y, 3, 65);
    DrawText(TEXT("NEXUS    /    ELYRA    /    ÚDOLÍ 07"), FLinearColor(.58f, .83f, .79f), 38, Y + 8);
    DrawText(Player->JournalPrompt(), FLinearColor::White, 38, Y + 34);
}
void ANexusExplorer::Notify(const FString &Message) const
{
    if (GEngine)
        GEngine->AddOnScreenDebugMessage(4707, 5.f, FColor(152, 235, 221), Message);
}
