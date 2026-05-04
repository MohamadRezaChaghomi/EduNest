'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Lock, PlayCircle } from 'lucide-react';

export default function CourseCurriculum({ sections }) {
  if (!sections?.length) return null;

  return (
    <div className="bg-card rounded-lg shadow-lg border border-border p-6">
      <h2 className="text-2xl font-bold mb-4">سرفصل‌های دوره</h2>
      <Accordion type="multiple" className="w-full">
        {sections.map((section) => (
          <AccordionItem key={section._id} value={section._id} className="border-border">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex justify-between w-full">
                <span className="font-medium">{section.title}</span>
                <span className="text-sm text-muted-foreground">{section.lessons?.length || 0} درس</span>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-2 pr-2">
                {section.lessons?.map((lesson, idx) => (
                  <li key={lesson._id} className="flex items-center gap-2 text-sm py-1 border-b border-border last:border-0">
                    {lesson.isFree ? (
                      <PlayCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    ) : (
                      <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    )}
                    <span className="flex-1">{idx + 1}. {lesson.title}</span>
                    {lesson.isFree && <Badge variant="outline" className="text-xs">رایگان</Badge>}
                    <span className="text-muted-foreground text-xs">{Math.floor(lesson.videoDuration / 60)} دقیقه</span>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}