#include "NexusValley.h"
#include "Components/HierarchicalInstancedStaticMeshComponent.h"
#include "Engine/StaticMesh.h"
#include "Engine/World.h"
#include "CollisionShape.h"
#include "CollisionQueryParams.h"
#if WITH_EDITOR
#include "MeshDescription.h"
#include "AssetRegistry/AssetRegistryModule.h"
#include "UObject/Package.h"
#include "StaticMeshAttributes.h"
#include "PhysicsEngine/BodySetup.h"
#endif
#include "Components/SceneComponent.h"
#include "Dom/JsonObject.h"
#include "Materials/MaterialInterface.h"
#include "Misc/Base64.h"
#include "Misc/FileHelper.h"
#include "Misc/Paths.h"
#include "ProceduralMeshComponent.h"
#include "Serialization/JsonSerializer.h"

namespace
{
struct FSurface
{
    TArray<FVector> Vertices, Normals;
    TArray<int32> Indices;
    TArray<FLinearColor> Colors;
    TArray<FVector2D> UV;
    void Apply(UProceduralMeshComponent *Component, int32 Section, bool bCollision)
    {
        Component->CreateMeshSection_LinearColor(Section, Vertices, Indices, Normals, UV, Colors, {}, bCollision);
    }
};

int16 ReadShort(const uint8 *P)
{
    return static_cast<int16>(uint16(P[0]) | (uint16(P[1]) << 8));
}
struct FGrid
{
    int32 Width, Height;
    double Step;
    TArray<uint8> Data;
    int32 Offset(int32 I, int32 J) const
    {
        return (J * Width + I) * 4;
    }
    double Z(int32 I, int32 J) const
    {
        I = FMath::Clamp(I, 0, Width - 1);
        J = FMath::Clamp(J, 0, Height - 1);
        return ReadShort(&Data[Offset(I, J)]) * 10.; // decimetres -> cm
    }
    double At(double East, double North) const
    {
        const double X = FMath::Clamp(East / Step + (Width - 1) * .5, 0., double(Width - 1));
        const double Y = FMath::Clamp(North / Step + (Height - 1) * .5, 0., double(Height - 1));
        const int32 I = FMath::FloorToInt(X), J = FMath::FloorToInt(Y);
        const double U = X - I, V = Y - J;
        if (U + V <= 1)
            return Z(I, J) * (1 - U - V) + Z(I + 1, J) * U + Z(I, J + 1) * V;
        return Z(I + 1, J + 1) * (U + V - 1) + Z(I, J + 1) * (1 - U) + Z(I + 1, J) * (1 - V);
    }
};

void BakeGround(UProceduralMeshComponent *Component, const FGrid &G, UMaterialInterface *Material)
{
    // Each patch uses global finite differences. Adjacent tiles share heights and normals.
    int32 Section = 0;
    constexpr int32 Patch = 50;
    for (int32 J0 = 0; J0 < G.Height - 1; J0 += Patch)
        for (int32 I0 = 0; I0 < G.Width - 1; I0 += Patch)
        {
            FSurface S;
            const int32 W = FMath::Min(Patch + 1, G.Width - I0), H = FMath::Min(Patch + 1, G.Height - J0);
            for (int32 Y = 0; Y < H; Y++)
                for (int32 X = 0; X < W; X++)
                {
                    const int32 I = I0 + X, J = J0 + Y;
                    const double E = (I - (G.Width - 1) * .5) * G.Step, N = (J - (G.Height - 1) * .5) * G.Step;
                    S.Vertices.Add(FVector(N * 100, E * 100, G.Z(I, J)));
                    const FVector Normal = FVector((G.Z(I, J - 1) - G.Z(I, J + 1)) / (200 * G.Step),
                                                   (G.Z(I - 1, J) - G.Z(I + 1, J)) / (200 * G.Step), 1)
                                               .GetSafeNormal();
                    S.Normals.Add(Normal);
                    S.UV.Add(FVector2D(E / 8, N / 8));
                    const int32 O = G.Offset(I, J);
                    FLinearColor C = FMath::Lerp(FLinearColor(.105f, .185f, .133f),
                                                 FLinearColor(.235f, .221f, .26f), G.Data[O + 2] / 255.f);
                    C = FMath::Lerp(C, FLinearColor(.35f, .285f, .19f), G.Data[O + 3] / 255.f);
                    C *= float(.97 + .03 * FMath::Sin(E * .061 + FMath::Cos(N * .04)));
                    C.A = 1;
                    S.Colors.Add(C);
                    if (X < W - 1 && Y < H - 1)
                    {
                        const int32 A = Y * W + X, B = A + 1, Ci = A + W, D = Ci + 1;
                        // Unreal front faces are clockwise as seen from above.
                        S.Indices.Append({A, B, Ci, B, D, Ci});
                    }
                }
            S.Apply(Component, Section, true);
            Component->SetMaterial(Section++, Material);
        }
}
const TArray<FString> SpeciesNames = {TEXT("aurora"), TEXT("spire"), TEXT("veil"), TEXT("boulder"), TEXT("shrub"),
                                      TEXT("fern"),   TEXT("fungi"), TEXT("slab"), TEXT("grass")};

TSharedPtr<FJsonObject> ReadScene()
{
    FString Text;
    TSharedPtr<FJsonObject> Object;
    if (FFileHelper::LoadFileToString(Text, *(FPaths::ProjectContentDir() / TEXT("FieldData/Scene.json"))))
        FJsonSerializer::Deserialize(TJsonReaderFactory<>::Create(Text), Object);
    return Object;
}
} // namespace

bool ANexusValley::BuildSpecies(const FString &Species)
{
#if WITH_EDITOR
    const auto Scene = ReadScene();
    if (!Scene.IsValid() || !SpeciesNames.Contains(Species))
        return false;
    TArray<uint8> Bytes;
    if (!FBase64::Decode(Scene->GetObjectField(TEXT("shapes"))->GetStringField(Species), Bytes) || !Bytes.Num() ||
        Bytes.Num() % 27)
        return false;
    FMeshDescription Mesh;
    FStaticMeshAttributes Attr(Mesh);
    Attr.Register();
    auto UV = Attr.GetVertexInstanceUVs();
    UV.SetNumChannels(1);
    const FPolygonGroupID Group = Mesh.CreatePolygonGroup();
    Attr.GetPolygonGroupMaterialSlotNames()[Group] = TEXT("Field");
    TArray<FVertexInstanceID> Corner;
    Corner.Reserve(3);
    for (int32 K = 0; K < Bytes.Num(); K += 27)
    {
        Corner.Reset();
        FVector3f Points[3];
        for (int32 L = 0; L < 3; L++)
        {
            const uint8 *P = &Bytes[K + L * 9];
            Points[L] = FVector3f(-ReadShort(P + 4), ReadShort(P), ReadShort(P + 2));
        }
        const FVector3f Normal =
            FVector3f::CrossProduct(Points[2] - Points[0], Points[1] - Points[0]).GetSafeNormal();
        if (Normal.IsNearlyZero())
            continue;
        for (int32 L = 0; L < 3; L++)
        {
            const uint8 *P = &Bytes[K + L * 9];
            const FVertexID V = Mesh.CreateVertex();
            Attr.GetVertexPositions()[V] = Points[L];
            const FVertexInstanceID I = Mesh.CreateVertexInstance(V);
            Attr.GetVertexInstanceNormals()[I] = Normal;
            Attr.GetVertexInstanceColors()[I] = FVector4f(P[6] / 255.f, P[7] / 255.f, P[8] / 255.f, 1);
            UV.Set(I, 0, FVector2f(Points[L].X * .002f, Points[L].Z * .002f));
            Corner.Add(I);
        }
        Mesh.CreatePolygon(Group, Corner);
    }
    auto *Material = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/FieldMaterials/M_Field.M_Field"));
    if (!Material)
        return false;
    const FString Name = TEXT("SM_") + Species;
    const FString Path = TEXT("/Game/Flora/") + Name;
    UStaticMesh *Asset = LoadObject<UStaticMesh>(nullptr, *(Path + TEXT(".") + Name));
    if (!Asset)
    {
        Asset = NewObject<UStaticMesh>(CreatePackage(*Path), FName(*Name),
                                       RF_Public | RF_Standalone | RF_Transactional);
        FAssetRegistryModule::AssetCreated(Asset);
    }
    Asset->Modify();
    Asset->SetNumSourceModels(1);
    Asset->GetStaticMaterials().Reset();
    Asset->GetStaticMaterials().Add(FStaticMaterial(Material, TEXT("Field")));
    auto &Settings = Asset->GetSourceModel(0).BuildSettings;
    Settings.bRecomputeNormals = false;
    Settings.bRecomputeTangents = true;
    Settings.bGenerateLightmapUVs = false;
    *Asset->CreateMeshDescription(0) = MoveTemp(Mesh);
    Asset->CommitMeshDescription(0);
    Asset->Build(false);
    Asset->CreateBodySetup();
    // Trunks and rocks block walking. Leaves and low plants are traversable.
    auto *Body = Asset->GetBodySetup();
    Body->AggGeom.EmptyElements();
    const int32 Id = SpeciesNames.IndexOfByKey(Species);
    const float Radius[] = {55, 48, 35, 92, 0, 0, 0, 58, 0};
    const float Height[] = {900, 1300, 350, 135, 0, 0, 0, 65, 0};
    if (Radius[Id] > 0)
    {
        FKBoxElem Box;
        Box.X = Box.Y = Radius[Id] * 1.5f;
        Box.Z = Height[Id];
        Box.Center.Z = Height[Id] / 2;
        Body->AggGeom.BoxElems.Add(Box);
    }
    Body->InvalidatePhysicsData();
    Body->CreatePhysicsMeshes();
    Asset->PostEditChange();
    Asset->MarkPackageDirty();
    return true;
#else
    return false;
#endif
}

ANexusValley::ANexusValley()
{
    RootComponent = CreateDefaultSubobject<USceneComponent>(TEXT("ValleyAnchor"));
    Ground = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("Ground"));
    for (const FString &Name : SpeciesNames)
    {
        auto *Grove = CreateDefaultSubobject<UHierarchicalInstancedStaticMeshComponent>(FName(*Name));
        Grove->SetupAttachment(RootComponent);
        Grove->SetCollisionProfileName(TEXT("BlockAll"));
        Groves.Add(Grove);
    }
    Water = CreateDefaultSubobject<UProceduralMeshComponent>(TEXT("Water"));
    Ground->SetupAttachment(RootComponent);
    Water->SetupAttachment(RootComponent);
    Ground->SetCollisionProfileName(TEXT("BlockAll"));
    Ground->bUseComplexAsSimpleCollision = true;
    Water->SetCollisionEnabled(ECollisionEnabled::NoCollision);
    Water->SetCastShadow(false);
}
bool ANexusValley::BakeField()
{
    const FString Folder = FPaths::ProjectContentDir() / TEXT("FieldData");
    const auto Scene = ReadScene();
    if (!Scene.IsValid())
        return false;
    FGrid G{int32(Scene->GetNumberField(TEXT("columns"))),
            int32(Scene->GetNumberField(TEXT("rows"))),
            Scene->GetNumberField(TEXT("step")),
            {}};
    if (G.Width != 251 || G.Height != 351 || G.Step != 10 ||
        !FFileHelper::LoadFileToArray(G.Data, *(Folder / TEXT("Ground.bin"))) ||
        G.Data.Num() != G.Width * G.Height * 4)
        return false;
    auto *Surface = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/FieldMaterials/M_Field.M_Field"));
    auto *WaterMat = LoadObject<UMaterialInterface>(nullptr, TEXT("/Game/FieldMaterials/M_Water.M_Water"));
    if (!Surface || !WaterMat)
        return false;
    Ground->ClearAllMeshSections();
    Water->ClearAllMeshSections();
    BakeGround(Ground, G, Surface);
    TArray<TArray<FTransform>> Groups;
    Groups.SetNum(SpeciesNames.Num());
    for (const auto &Item : Scene->GetArrayField(TEXT("placements")))
    {
        const auto &A = Item->AsArray();
        const int32 Id = SpeciesNames.IndexOfByKey(A[0]->AsString());
        if (Id == INDEX_NONE)
            return false;
        const double E = A[1]->AsNumber(), N = A[2]->AsNumber();
        Groups[Id].Emplace(FRotator(0, -FMath::RadiansToDegrees(A[4]->AsNumber()), 0),
                           FVector(N * 100, E * 100, G.At(E, N)), FVector(A[3]->AsNumber()));
    }
    for (int32 I = 0; I < Groves.Num(); I++)
    {
        const FString Name = TEXT("SM_") + SpeciesNames[I];
        auto *Mesh = LoadObject<UStaticMesh>(nullptr, *(TEXT("/Game/Flora/") + Name + TEXT(".") + Name));
        if (!Mesh)
            return false;
        Groves[I]->ClearInstances();
        Groves[I]->SetStaticMesh(Mesh);
        Groves[I]->AddInstances(Groups[I], false, false);
    }
    FSurface S;
    for (const auto &Item : Scene->GetArrayField(TEXT("water")))
    {
        const auto &A = Item->AsArray();
        const double E = A[0]->AsNumber(), N = A[1]->AsNumber(), H = A[2]->AsNumber();
        S.Indices.Add(S.Vertices.Add(FVector(N * 100, E * 100, H * 100)));
        S.Normals.Add(FVector::UpVector);
        S.UV.Add(FVector2D(E * .32, N * .32));
        const float Depth = FMath::Clamp(float((H * 100 - G.At(E, N)) / 120.), 0.f, 1.f);
        S.Colors.Add(FMath::Lerp(FLinearColor(.09f, .36f, .33f), FLinearColor(.02f, .115f, .15f), Depth));
    }
    S.Apply(Water, 0, false);
    Water->SetMaterial(0, WaterMat);
    return Ground->GetNumSections() > 0 && Water->GetNumSections() == 1;
}

bool ANexusValley::CheckWalkableScene() const
{
    if (!GetWorld() || Ground->GetNumSections() != 35 || Water->GetNumSections() != 1)
        return false;
    int32 Count = 0;
    for (const auto &Grove : Groves)
        Count += Grove->GetInstanceCount();
    if (!Count)
        return false;
    FCollisionQueryParams Params(SCENE_QUERY_STAT(NexusBakeCheck), true);
    auto FloorAt = [&](double North, double East, double Expected, double Tolerance)
    {
        FHitResult Hit;
        const FVector XY(North * 100, East * 100, 0);
        return GetWorld()->LineTraceSingleByChannel(Hit, XY + FVector(0, 0, 65000), XY - FVector(0, 0, 20000),
                                                    ECC_Visibility, Params) &&
               FMath::Abs(Hit.ImpactPoint.Z - Expected) <= Tolerance;
    };
    // Spawn pad, dry approach and lake bed. The non-blocking water must not catch this ray.
    if (!FloorAt(-12.5, 4, 1800, 4) || !FloorAt(0, 0, 1800, 4) || !FloorAt(-180, 220, 1890, 16))
        return false;
    FHitResult DoorHit;
    // Head and shoulders through the opening, clear of the roof and floor.
    return !GetWorld()->SweepSingleByChannel(DoorHit, FVector(405, 1200, 1910), FVector(1130, 1200, 1910),
                                             FQuat::Identity, ECC_Visibility, FCollisionShape::MakeCapsule(36, 88),
                                             Params);
}
