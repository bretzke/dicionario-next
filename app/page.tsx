"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getRandomHexColor } from "@/utils/colors";
import Graph from "graphology";
import { Search } from "lucide-react";
import { useEffect, useState } from "react";
import { Sigma } from "sigma";

interface DictionaryDataProps {
  word: string;
  relatedWords: string[];
}

const GRAPH_CONTAINER_ID = "sigma-container";

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dictionaryData, setDictionaryData] = useState<DictionaryDataProps>({
    word: "",
    relatedWords: [],
  });

  async function getRelatedWords(word: string) {
    setInputValue(word);
    setIsSubmitting(true);

    setDictionaryData({ word, relatedWords: [] });

    const response = await fetch("/api/search", {
      method: "POST",
      body: JSON.stringify({
        word: word,
      }),
    });

    const data = await response.json();

    setDictionaryData((prevState) => ({
      ...prevState,
      relatedWords: data.relatedWords,
    }));

    setIsSubmitting(false);
  }

  useEffect(() => {
    if (!dictionaryData.relatedWords.length) {
      return;
    }

    const container = document.getElementById(
      GRAPH_CONTAINER_ID
    ) as HTMLElement;

    container.innerHTML = "";

    const graph = new Graph();
    graph.addNode(dictionaryData.word, {
      label: dictionaryData.word,
      x: 1,
      y: 1,
      size: 30,
      color: "#000000",
    });

    const middleIndex = Math.ceil(dictionaryData.relatedWords.length / 2);
    const firstHalf = dictionaryData.relatedWords.slice(0, middleIndex);
    const secondHalf = dictionaryData.relatedWords.slice(middleIndex);

    const addRelatedWordOnGraph = (
      relatedWords: string[],
      positionY: number
    ) => {
      let positionX = 1 - Math.ceil(relatedWords.length / 2);

      relatedWords.forEach((relatedWord) => {
        graph.addNode(relatedWord, {
          label: relatedWord,
          x: positionX,
          y: positionY,
          size: 20,
          color: getRandomHexColor(),
        });

        graph.addEdge(dictionaryData.word, relatedWord);

        positionX++;
      });
    };

    addRelatedWordOnGraph(firstHalf, 0);
    addRelatedWordOnGraph(secondHalf, 2);

    const sigma = new Sigma(graph, container, {
      allowInvalidContainer: true,
    });

    sigma.addListener("clickNode", (e) => {
      if (e.node !== dictionaryData.word) {
        getRelatedWords(e.node);
      }
    });
  }, [dictionaryData.relatedWords]);

  return (
    <section className="p-8 flex flex-col gap-8 min-h-screen">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          getRelatedWords(inputValue);
        }}
      >
        <div className="flex gap-2">
          <Input
            placeholder="Procurar..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Button type="submit" disabled={isSubmitting || !inputValue.length}>
            <Search />
          </Button>
        </div>
      </form>

      {dictionaryData.word.length > 0 && !isSubmitting && (
        <div className="flex flex-col gap-4 grow">
          {dictionaryData.relatedWords.length > 0 && (
            <h3 className="text-2xl">
              Palavra pesquisada: <strong>{dictionaryData.word}</strong>
            </h3>
          )}

          {dictionaryData.relatedWords.length > 0 ? (
            <>
              <div className="flex flex-col w-fit m-auto">
                <h4 className="text-xl">Palavras relacionadas</h4>
                <hr />
              </div>
              <div className="m-auto flex gap-2 flex-wrap">
                {dictionaryData.relatedWords.map((relatedWord) => (
                  <Button
                    variant="outline"
                    key={relatedWord}
                    onClick={() => getRelatedWords(relatedWord)}
                  >
                    {relatedWord}
                  </Button>
                ))}
              </div>

              <div
                id={GRAPH_CONTAINER_ID}
                className="w-full grow border border-black"
              />
            </>
          ) : (
            <h3 className="text-2xl text-center">
              Nenhum resultado para <strong>{dictionaryData.word}</strong> foi
              encontrado :(
            </h3>
          )}
        </div>
      )}
    </section>
  );
}

