import {router, useLocalSearchParams} from "expo-router";
import {Image, Pressable, View} from "react-native";
import {RootView} from "@/components/RootView";
import {StyleSheet} from "react-native";
import {Row} from "@/components/Row";
import {ThemedText} from "@/components/ThemedText";
import {useFetchQuery} from "@/hooks/useFetchQuery";
import {Colors} from "@/constants/Colors";
import {useThemeColors} from "@/hooks/useThemeColors";
import {basePokemonStats, formatSize, formatWeight, getPokemonArtwork} from "@/functions/pokemon";
import {Card} from "@/components/Card";
import {PokemonType} from "@/components/pokemon/PokemonType";
import {PokemonSpec} from "@/components/pokemon/PokemonSpec";
import {PokemonStats} from "@/components/pokemon/PokemonStats";
import {Audio} from "expo-av";

export default function Pokemon(){
    const colors = useThemeColors();
    const params = useLocalSearchParams() as {id: string};
    const  {data: pokemon} = useFetchQuery('/pokemon/:id', {id: params.id});
    const  {data: species} = useFetchQuery('/pokemon-species/:id', {id: params.id});
    const mainType = pokemon?.types[0].type.name;
    const colorType = mainType ? Colors.type[mainType] : colors.tint;
    const types = pokemon?.types ?? [];
    const bio = species?.flavor_text_entries.find(({language}) =>
        language.name === 'en')?.flavor_text.replaceAll('\n', '. ');
    const stats = pokemon?.stats ?? basePokemonStats;

    const onImagePress = async () => {
        const cry = pokemon?.cries.latest;
        if(!cry) return;
        const {sound} = await Audio.Sound.createAsync(
            {
                uri: cry
            },
            {
                shouldPlay: true
            });
        sound.playAsync();
    }

    const id = parseInt(params.id, 10);

    const onNext = () => {
        router.replace({pathname: "/pokemon/[id]", params: {id: Math.min(id + 1, 151)}});
    }

    const onPrevious = () => {
        router.replace({pathname: "/pokemon/[id]", params: {id: Math.max(id - 1, 1)}});
    }

    const isFirst = id === 1;

    const isLast = id === 151;

    return(
        <RootView backgroundColor={colorType}>
            <View>
                <Image
                    source={require('@/assets/images/Pokeball_big.png')}
                    style={styles.pokeball}
                    width={208}
                    height={208}
                />
                <Row style={styles.header}>
                    <Pressable onPress={router.back}>
                        <Row gap={8}>
                            <Image
                                source={require('@/assets/images/back.png')}
                                width={32}
                                height={32}
                            />
                            <ThemedText variant="headline" color="grayWhite" style={{textTransform: "capitalize"}}>
                                {pokemon?.name}
                            </ThemedText>
                        </Row>
                    </Pressable>
                    <ThemedText variant="subtitle2" color={"grayWhite"}>
                        #{params.id.padStart(3, "0")}
                    </ThemedText>
                </Row>
                <View style={styles.body}>
                    <Row style={styles.imageRow}>
                        {isFirst ? (
                            <View style={{width:24, height:24}}></View>
                            )
                            :
                            (<Pressable onPress={onPrevious}>
                            <Image
                                width={24}
                                height={24}
                                source={require('@/assets/images/prev.png')}
                            />
                        </Pressable>)}
                        <Pressable onPress={onImagePress}>
                            <Image style={styles.artwork} source={{
                                uri: getPokemonArtwork(+params.id)
                            }}
                                   width={200}
                                   height={200}
                            />
                        </Pressable>
                        {isLast ? <View></View> : <Pressable onPress={onNext}>
                            <Image
                                width={24}
                                height={24}
                                source={require('@/assets/images/next.png')}
                            />
                        </Pressable>}
                    </Row>
                    {/*Types*/}
                    <Card style={styles.card}>
                        <Row gap={16} style={{height:20}}>
                            {types.map((type) => (
                            <PokemonType name={type.type.name} key={type.type.name}/>
                            ))}
                        </Row>
                        {/*About*/}
                        <ThemedText variant={"subtitle1"} style={{color: colorType}}>
                            About
                        </ThemedText>
                        <Row>
                            <PokemonSpec
                                title={formatWeight(pokemon?.weight)}
                                description={"Weight"}
                                image={require('@/assets/images/weight.png')}
                                style={{borderStyle: "solid", borderRightWidth: 1, borderColor: colors.grayLight}}
                            />
                            <PokemonSpec
                                title={formatSize(pokemon?.height)}
                                description={"Size"}
                                image={require('@/assets/images/straighten.png')}
                                style={{borderStyle: "solid", borderRightWidth: 1, borderColor: colors.grayLight}}
                            />
                            <PokemonSpec
                                title={pokemon?.moves.slice(0, 2)
                                    .map((move) => move.move.name).join("\n")}
                                description={"Moves"}
                            />
                        </Row>
                        <ThemedText>
                            {bio}
                        </ThemedText>
                        {/*Stats*/}
                        <ThemedText variant={"subtitle1"} style={{color: colorType}}>
                            Base Stats
                        </ThemedText>
                        <View style={{alignSelf: "stretch"}}>
                            {stats.map((stat) => (
                                <PokemonStats
                                    key={stat.stat.name}
                                    color={colorType}
                                    name={stat.stat.name}
                                    value={stat.base_stat}
                                />
                            ))}
                        </View>
                    </Card>
                </View>
            </View>
        </RootView>
    )
}

const styles =  StyleSheet.create({
    header:{
        margin:20,
        justifyContent:'space-between',
    },
    pokeball:{
        opacity: .1,
        position: 'absolute',
        right: 8,
        top: 8,
    },
    imageRow:{
        position: "absolute",
        top: -140,
        zIndex: 2,
        justifyContent: "space-between",
        left: 0,
        right: 0,
        paddingHorizontal: 20,
    },
    artwork:{

    },
    body:{
        marginTop:144,
    },
    card:{
        paddingHorizontal: 20,
        paddingTop: 60,
        gap: 16,
        alignItems: 'center',
        paddingBottom: 20,
    },

})